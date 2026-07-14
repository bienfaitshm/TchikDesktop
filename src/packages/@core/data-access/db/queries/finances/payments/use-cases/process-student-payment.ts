import { type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  RecordNotFoundError,
  TransactionError,
} from "@/packages/drizzle-queries";
import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import {
  FeeAssignmentRepository,
  FeeConfigurationRepository,
  StudentPaymentRepository,
  DailyExchangeRateRepository,
  WalletRepository,
} from "../../repository";
import { CustomLogger } from "@/packages/logger";
import { validateContext, getLocalDateString } from "../utils";
import {
  ExchangeRateNotFoundError,
  OverpaymentError,
  BusinessRuleError,
} from "../errors";
import { EXCHANGE_RATE_SCALE } from "../constants";

export class ProcessStudentPayment {
  constructor(
    private readonly feeConfigRepo: FeeConfigurationRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly studentPaymentRepo: StudentPaymentRepository,
    private readonly rateRepo: DailyExchangeRateRepository,
    private readonly walletRepo: WalletRepository,
    private readonly clientDb: TDataBase,
    private readonly logger: CustomLogger,
  ) {}

  async execute(payload: {
    schoolId: string;
    yearId: string;
    assignmentId: string;
    amountReceived: number;
    currencyReceived: CURRENCY_ENUM;
    paymentMethod?: PAYMENT_METHOD_ENUM;
    transactionReference?: string;
  }) {
    validateContext(payload.schoolId, payload.yearId);
    this.logger.info(
      `[Payment processing] Initiating payment for assignment ${payload.assignmentId}`,
    );

    try {
      const { assignmentRecord, configRecord } = await this.fetchRecords(
        payload.assignmentId,
      );

      const { amountConverted, exchangeRateMultiplied } =
        await this.calculateConversion(
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

      return await this.executeTransaction(
        payload,
        configRecord,
        amountConverted,
        exchangeRateMultiplied,
      );
    } catch (error) {
      this.logger.error(
        `[Payment processing] Transaction failed for assignment ${payload.assignmentId}`,
        error,
      );
      throw this.handleError(error);
    }
  }

  private async fetchRecords(assignmentId: string) {
    const assignmentRecord = await this.feeAssignmentRepo.findById(
      assignmentId,
      this.clientDb,
    );
    if (!assignmentRecord)
      throw new RecordNotFoundError(`Fee assignment [${assignmentId}]`);

    const configRecord = await this.feeConfigRepo.findById(
      assignmentRecord.feeConfigId as string,
      this.clientDb,
    );
    if (!configRecord)
      throw new RecordNotFoundError(
        `Fee configuration [${assignmentRecord.feeConfigId}]`,
      );

    return { assignmentRecord, configRecord };
  }

  private async calculateConversion(
    amount: number,
    fromCurrency: CURRENCY_ENUM,
    toCurrency: CURRENCY_ENUM,
    schoolId: string,
  ) {
    if (fromCurrency === toCurrency) {
      return {
        amountConverted: amount,
        exchangeRateMultiplied: EXCHANGE_RATE_SCALE,
      };
    }

    const todayStr = getLocalDateString();
    const rateRow = await this.rateRepo.getLatestExchangeRate(
      {
        where: {
          schoolId,
          date: todayStr,
          currencyFrom: fromCurrency,
          currencyTo: toCurrency,
        },
      },
      this.clientDb,
    );

    if (!rateRow)
      throw new ExchangeRateNotFoundError(fromCurrency, toCurrency, todayStr);

    const amountConverted = Math.round(
      (amount * EXCHANGE_RATE_SCALE) / rateRow.rate,
    );
    return { amountConverted, exchangeRateMultiplied: rateRow.rate };
  }

  private verifyDebt(
    totalAmount: number,
    amountPaid: number,
    amountConverted: number,
    currency: string,
  ) {
    const remainingDebt = totalAmount - amountPaid;
    if (amountConverted > remainingDebt) {
      throw new OverpaymentError(remainingDebt, currency);
    }
  }

  private async executeTransaction(
    payload: any,
    configRecord: any,
    amountConverted: number,
    exchangeRate: number,
  ) {
    return await this.clientDb.transaction(async (tx) => {
      const newPayment = await this.studentPaymentRepo.create(
        {
          assignmentId: payload.assignmentId,
          amountReceived: payload.amountReceived,
          currencyReceived: payload.currencyReceived,
          appliedExchangeRate: exchangeRate,
          amountConverted: amountConverted,
          paymentMethod: payload.paymentMethod ?? PAYMENT_METHOD_ENUM.CASH,
          transactionReference: payload.transactionReference,
        },
        tx,
      );

      const assignment = await this.feeAssignmentRepo.updateAssignmentProgress(
        payload.assignmentId,
        amountConverted,
        configRecord.totalAmount,
        tx,
      );
      await this.walletRepo.incrementWalletBalance(
        configRecord.wallet.walletId,
        amountConverted,
        tx,
      );

      this.logger.info(
        `[Payment processing] Success for assignment ${payload.assignmentId}. ID: ${newPayment.paymentId}`,
      );
      return { ...assignment, payment: newPayment };
    });
  }

  private handleError(error: unknown) {
    if (
      error instanceof BusinessRuleError ||
      error instanceof RecordNotFoundError
    )
      return error;
    return new TransactionError(
      "Payment processing failed and was rolled back.",
      { cause: error },
    );
  }
}
