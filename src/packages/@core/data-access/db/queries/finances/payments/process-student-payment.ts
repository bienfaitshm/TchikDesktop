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
  FeeConfigurationRepository,
  StudentPaymentRepository,
  WalletRepository,
} from "../repository";
import { CustomLogger } from "@/packages/logger";
import { validateContext } from "./utils";
import { OverpaymentError, BusinessRuleError } from "./errors";
import { DailyExchangeRateService } from "../services";
import {
  FeeAssignment,
  FeeConfiguration,
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
  feeConfig: FeeConfiguration;
}

export interface CancelPaymentResult extends ProcessPaymentResult {}

/**
 * Domain service managing student payment lifecycle including processing and rollbacks.
 */
export class StudentPaymentService {
  /**
   * Initializes a new instance of StudentPaymentService.
   * @param feeConfigRepo - Repository for fee configurations.
   * @param feeAssignmentRepo - Repository for fee assignments.
   * @param studentPaymentRepo - Repository for student payments.
   * @param rateService - Service for exchange rate calculations.
   * @param walletRepo - Repository for wallet management.
   * @param clientDb - Database client connection instance.
   * @param logger - Custom logger instance.
   */
  constructor(
    private readonly feeConfigRepo: FeeConfigurationRepository,
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
   * @returns The updated assignment record along with created payment and config details.
   */
  public execute(payload: ProcessPaymentPayload): ProcessPaymentResult {
    validateContext(payload.schoolId, payload.yearId);
    this.logger.info(
      `[Payment processing] Initiating payment for assignment ${payload.assignmentId}`,
    );

    try {
      return this.clientDb.transaction((tx) => {
        const { assignmentRecord, configRecord } =
          this.fetchAndValidateAssignmentAndConfig(payload.assignmentId, tx);

        const { amountConverted, exchangeRateMultiplied } =
          this.rateService.computeExchangeRate(
            payload.amountReceived,
            payload.currencyReceived,
            configRecord.currency,
            payload.schoolId,
          );

        this.verifyDebt(
          configRecord.totalAmount,
          assignmentRecord.amountPaid,
          amountConverted,
          configRecord.currency,
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
          configRecord,
          tx,
        );

        this.logger.info(
          `[Payment processing] Success for assignment ${payload.assignmentId}. ID: ${payment.paymentId}`,
        );

        return {
          ...updatedAssignment,
          payment,
          feeConfig: configRecord,
        };
      });
    } catch (error) {
      this.logger.error(
        `[Payment processing] Transaction failed for assignment ${payload.assignmentId}`,
        error,
      );
      throw this.handleError(error);
    }
  }

  /**
   * Cancels an existing student payment and reverts all associated financial state changes.
   * @param paymentId - Unique identifier of the payment to revert.
   * @returns The updated assignment record with canceled payment and config details.
   */
  public cancelPayment(paymentId: string): CancelPaymentResult {
    this.logger.info(
      `[Payment rollback] Initiating cancellation for payment ${paymentId}`,
    );

    try {
      return this.clientDb.transaction((tx) => {
        const payment = this.fetchAndValidatePayment(paymentId, tx);
        const { assignmentRecord, configRecord } =
          this.fetchAndValidateAssignmentAndConfig(payment.assignmentId, tx);

        const canceledPayment = this.studentPaymentRepo.cancelPayment(
          paymentId,
          tx,
        );

        const updatedAssignment =
          this.feeAssignmentRepo.revertAssignmentProgress(
            payment.assignmentId,
            payment.amountConverted,
            configRecord.totalAmount,
            tx,
          );

        this.walletRepo.updateWalletBalance(
          configRecord.wallet.walletId,
          payment.amountConverted,
          "DECREASE",
          tx,
        );

        this.logger.info(
          `[Payment rollback] Success for payment ${paymentId}. Assignment ID: ${payment.assignmentId}`,
        );

        return {
          ...updatedAssignment,
          payment: canceledPayment,
          feeConfig: configRecord,
        };
      });
    } catch (error) {
      this.logger.error(
        `[Payment rollback] Transaction failed for payment ${paymentId}`,
        error,
      );
      throw this.handleError(error);
    }
  }

  /**
   * Fetches and validates fee assignment and configuration records.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param tx - Active database transaction client.
   * @returns The validated assignment and configuration records.
   */
  private fetchAndValidateAssignmentAndConfig(
    assignmentId: string,
    tx: any,
  ): { assignmentRecord: FeeAssignment; configRecord: FeeConfiguration } {
    const assignmentRecord = this.feeAssignmentRepo.findById(assignmentId, tx);
    if (!assignmentRecord) {
      throw new RecordNotFoundError(`Fee assignment [${assignmentId}]`);
    }

    if (!assignmentRecord.feeConfigId) {
      throw new BusinessRuleError(
        `Fee assignment [${assignmentId}] lacks a valid configuration ID.`,
      );
    }

    const configRecord = this.feeConfigRepo.findById(
      assignmentRecord.feeConfigId,
      tx,
    );
    if (!configRecord) {
      throw new RecordNotFoundError(
        `Fee configuration [${assignmentRecord.feeConfigId}]`,
      );
    }

    return { assignmentRecord, configRecord };
  }

  /**
   * Fetches and validates an existing student payment record.
   * @param paymentId - Unique identifier of the payment.
   * @param tx - Active database transaction client.
   * @returns The validated payment record.
   */
  private fetchAndValidatePayment(paymentId: string, tx: any): StudentPayment {
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
    tx: any,
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
   * @param configRecord - Fee configuration record.
   * @param tx - Active database transaction client.
   * @returns The updated assignment record.
   */
  private updateAssignmentAndWallet(
    assignmentId: string,
    amountConverted: number,
    configRecord: FeeConfiguration,
    tx: any,
  ): FeeAssignment {
    const updatedAssignment = this.feeAssignmentRepo.updateAssignmentProgress(
      assignmentId,
      amountConverted,
      configRecord.totalAmount,
      tx,
    );

    this.walletRepo.updateWalletBalance(
      configRecord.wallet.walletId,
      amountConverted,
      "INCREASE",
      tx,
    );

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
