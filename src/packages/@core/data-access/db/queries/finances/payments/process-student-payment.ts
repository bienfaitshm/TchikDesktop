import { type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  RecordNotFoundError,
  TransactionError,
} from "@/packages/drizzle-queries";
import {
  CURRENCY_ENUM,
  PAYMENT_STATUS_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import {
  FeeAssignmentRepository,
  StudentPaymentRepository,
  WalletRepository,
  type FeeAssignmentDTO,
} from "../repository";
import { CustomLogger } from "@/packages/logger";
import { validateContext } from "./utils";
import { OverpaymentError, BusinessRuleError } from "./errors";
import { DailyExchangeRateService } from "../services";
import {
  FeeAssignment,
  StudentPayment,
} from "@/packages/@core/data-access/db/schemas";

export interface ProcessPaymentPayload {
  schoolId: string;
  yearId: string;
  assignmentId: string;
  amountReceived: number;
  currencyReceived: CURRENCY_ENUM;
  paymentMethod?: PAYMENT_METHOD_ENUM;
  transactionReference?: string;
}

export interface ProcessPaymentResult extends FeeAssignment {
  payment: StudentPayment;
}

export interface CancelPaymentResult extends ProcessPaymentResult {}

/**
 * Domain service managing student payment lifecycle including processing and rollbacks.
 */
export class StudentPaymentService {
  /**
   * Initializes a new instance of StudentPaymentService.
   * @param feeAssignmentRepo - Repository for fee assignments.
   * @param studentPaymentRepo - Repository for student payments.
   * @param rateService - Service for exchange rate calculations.
   * @param walletRepo - Repository for wallet management.
   * @param clientDb - Database client connection instance.
   * @param logger - Custom logger instance.
   */
  constructor(
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly studentPaymentRepo: StudentPaymentRepository,
    private readonly rateService: DailyExchangeRateService,
    private readonly walletRepo: WalletRepository,
    private readonly clientDb: TDataBase,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Executes the student payment workflow synchronously within a transaction.
   * @param payload - Details of the payment transaction to process.
   * @returns The updated assignment record along with created payment details.
   */
  public executePayment(payload: ProcessPaymentPayload): ProcessPaymentResult {
    validateContext(payload.schoolId, payload.yearId);
    return this.executeInTransaction(
      `Payment processing`,
      payload.assignmentId,
      (tx) => {
        const assignmentRecord = this.fetchAssignment(payload.assignmentId, tx);

        const { amountConverted, exchangeRateMultiplied } =
          this.rateService.computeExchangeRate(
            payload.amountReceived,
            payload.currencyReceived,
            assignmentRecord.currency,
            payload.schoolId,
          );

        this.verifyDebt(
          assignmentRecord.totalAmount,
          assignmentRecord.amountPaid,
          amountConverted,
          assignmentRecord.currency,
        );

        const payment = this.createPaymentRecord(
          payload,
          exchangeRateMultiplied,
          amountConverted,
          tx,
        );

        const updatedAssignment = this.updateAssignmentAndWallet(
          payload.assignmentId,
          amountConverted,
          assignmentRecord.feeType.walletId,
          tx,
        );

        this.logger.info(
          `[Payment processing] Success for assignment ${payload.assignmentId}. ID: ${payment.paymentId}`,
        );

        return {
          ...updatedAssignment,
          payment,
        };
      },
    );
  }

  /**
   * Cancels an existing student payment and reverts all associated financial state changes.
   * @param paymentId - Unique identifier of the payment to revert.
   * @returns The updated assignment record with canceled payment details.
   */
  public cancelPayment(paymentId: string): CancelPaymentResult {
    return this.executeInTransaction(`Payment rollback`, paymentId, (tx) => {
      const payment = this.fetchValidatePayment(paymentId, tx);
      const assignment = this.fetchAssignment(payment.assignmentId, tx);

      const canceledPayment = this.studentPaymentRepo.cancelPayment(
        paymentId,
        tx,
      );
      if (!canceledPayment) {
        this.logger.info(
          `[Payment rollback] Error for cancel a payment ${paymentId}. Assignment ID: ${payment.assignmentId}`,
        );
        throw new BusinessRuleError("Impossible to cancel payment");
      }

      const updatedAssignment = this.feeAssignmentRepo.revertAssignmentProgress(
        payment.assignmentId,
        payment.amountConverted,
        tx,
      );

      this.walletRepo.updateWalletBalance(assignment.feeType.walletId, tx);

      this.logger.info(
        `[Payment rollback] Success for payment ${paymentId}. Assignment ID: ${payment.assignmentId}`,
      );

      return {
        ...updatedAssignment,
        payment: canceledPayment,
      };
    });
  }

  /**
   * Executes a callback function inside a database transaction with standardized logging and error handling.
   * @param actionType - Label for logging context.
   * @param entityId - Identifier of the entity being processed.
   * @param action - Synchronous callback function performing database operations.
   * @returns The result of the transaction callback.
   */
  private executeInTransaction<T>(
    actionType: string,
    entityId: string,
    action: (tx: TDataBase) => T,
  ): T {
    this.logger.info(`[${actionType}] Initiating for entity ${entityId}`);
    try {
      return this.clientDb.transaction((tx) => action(tx));
    } catch (error) {
      this.logger.error(
        `[${actionType}] Transaction failed for entity ${entityId}`,
        error,
      );
      throw this.handleError(error);
    }
  }

  /**
   * Fetches and validates fee assignment records.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param tx - Active database transaction client.
   * @returns The validated assignment records.
   */
  private fetchAssignment(
    assignmentId: string,
    tx: TDataBase,
  ): FeeAssignmentDTO {
    const assignmentRecord = this.feeAssignmentRepo.findById(assignmentId, tx);
    if (!assignmentRecord) {
      throw new RecordNotFoundError(`Fee assignment [${assignmentId}]`);
    }
    return assignmentRecord;
  }

  /**
   * Fetches and validates an existing student payment record.
   * @param paymentId - Unique identifier of the payment.
   * @param tx - Active database transaction client.
   * @returns The validated payment record.
   */
  private fetchValidatePayment(
    paymentId: string,
    tx: TDataBase,
  ): StudentPayment {
    const payment = this.studentPaymentRepo.findById(paymentId, tx);
    if (!payment) {
      throw new RecordNotFoundError(`Payment [${paymentId}]`);
    }

    if (payment.status === PAYMENT_STATUS_ENUM.CANCELED) {
      throw new BusinessRuleError(
        `Cannot process fee assignment because the payment [${payment.paymentId}] is canceled.`,
      );
    }

    return payment;
  }

  /**
   * Creates a new student payment record.
   * @param payload - Payment processing payload.
   * @param exchangeRateMultiplied - Applied exchange rate.
   * @param amountConverted - Converted payment amount.
   * @param tx - Active database transaction client.
   * @returns The created payment record.
   */
  private createPaymentRecord(
    payload: ProcessPaymentPayload,
    exchangeRateMultiplied: number,
    amountConverted: number,
    tx: TDataBase,
  ): StudentPayment {
    return this.studentPaymentRepo.create(
      {
        assignmentId: payload.assignmentId,
        amountReceived: payload.amountReceived,
        currencyReceived: payload.currencyReceived,
        appliedExchangeRate: exchangeRateMultiplied,
        amountConverted,
        paymentMethod: payload.paymentMethod ?? PAYMENT_METHOD_ENUM.CASH,
        transactionReference: payload.transactionReference,
        schoolId: payload.schoolId,
        yearId: payload.yearId,
      },
      tx,
    );
  }

  /**
   * Updates the fee assignment progress and increases the wallet balance.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param amountConverted - Converted payment amount.
   * @param walletId - Identifier of the wallet to update.
   * @param tx - Active database transaction client.
   * @returns The updated assignment record.
   */
  private updateAssignmentAndWallet(
    assignmentId: string,
    amountConverted: number,
    walletId: string,
    tx: TDataBase,
  ): FeeAssignment {
    const updatedAssignment = this.feeAssignmentRepo.updateAssignmentProgress(
      assignmentId,
      amountConverted,
      tx,
    );

    this.walletRepo.updateWalletBalance(walletId, tx);

    return updatedAssignment;
  }

  /**
   * Verifies that the payment amount does not exceed the remaining unpaid debt.
   * @param totalAmount - Total amount expected for the fee configuration.
   * @param amountPaid - Amount already paid towards the fee assignment.
   * @param amountConverted - The newly converted payment amount to apply.
   * @param currency - The currency code for error reporting context.
   */
  private verifyDebt(
    totalAmount: number,
    amountPaid: number,
    amountConverted: number,
    currency: string,
  ): void {
    const remainingDebt = totalAmount - amountPaid;
    if (amountConverted > remainingDebt) {
      throw new OverpaymentError(remainingDebt, currency);
    }
  }

  /**
   * Normalizes errors into appropriate application or transaction exceptions.
   * @param error - The caught error instance.
   * @returns An error instance ready to be thrown.
   */
  private handleError(error: unknown): Error {
    if (
      error instanceof BusinessRuleError ||
      error instanceof RecordNotFoundError ||
      error instanceof OverpaymentError
    ) {
      return error;
    }
    return new TransactionError(
      "Payment processing failed and was rolled back.",
      { cause: error },
    );
  }
}
