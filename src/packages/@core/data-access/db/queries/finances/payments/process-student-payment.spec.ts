import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudentPaymentService } from "./process-student-payment";
import { RecordNotFoundError } from "@/packages/drizzle-queries";
import {
  CURRENCY_ENUM,
  PAYMENT_STATUS_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import { OverpaymentError, BusinessRuleError } from "./errors";

describe("StudentPaymentService", () => {
  let feeConfigRepo: any;
  let feeAssignmentRepo: any;
  let studentPaymentRepo: any;
  let rateService: any;
  let walletRepo: any;
  let clientDb: any;
  let logger: any;
  let service: StudentPaymentService;

  beforeEach(() => {
    feeConfigRepo = {
      findById: vi.fn(),
    };
    feeAssignmentRepo = {
      findById: vi.fn(),
      updateAssignmentProgress: vi.fn(),
      revertAssignmentProgress: vi.fn(),
    };
    studentPaymentRepo = {
      findById: vi.fn(),
      create: vi.fn(),
      cancelPayment: vi.fn(),
    };
    rateService = {
      computeExchangeRate: vi.fn(),
    };
    walletRepo = {
      updateWalletBalance: vi.fn(),
    };
    clientDb = {
      transaction: vi.fn((cb) => cb({})),
    };
    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    service = new StudentPaymentService(
      feeConfigRepo,
      feeAssignmentRepo,
      studentPaymentRepo,
      rateService,
      walletRepo,
      clientDb,
      logger,
    );
  });

  describe("executePayment", () => {
    const validPayload = {
      schoolId: "school-1",
      yearId: "year-1",
      assignmentId: "assign-1",
      amountReceived: 100,
      currencyReceived: CURRENCY_ENUM.USD,
      paymentMethod: PAYMENT_METHOD_ENUM.CASH,
    };

    it("should process payment successfully when nominal case", () => {
      feeAssignmentRepo.findById.mockReturnValue({
        assignmentId: "assign-1",
        feeConfigId: "config-1",
        amountPaid: 0,
      });
      feeConfigRepo.findById.mockReturnValue({
        feeConfigId: "config-1",
        totalAmount: 500,
        currency: CURRENCY_ENUM.USD,
        wallet: { walletId: "wallet-1" },
      });
      rateService.computeExchangeRate.mockReturnValue({
        amountConverted: 100,
        exchangeRateMultiplied: 1,
      });
      studentPaymentRepo.create.mockReturnValue({
        paymentId: "pay-1",
        assignmentId: "assign-1",
      });
      feeAssignmentRepo.updateAssignmentProgress.mockReturnValue({
        assignmentId: "assign-1",
        amountPaid: 100,
      });

      const result = service.executePayment(validPayload);

      expect(result).toBeDefined();
      expect(result.payment.paymentId).toBe("pay-1");
      expect(feeAssignmentRepo.updateAssignmentProgress).toHaveBeenCalled();
      expect(walletRepo.updateWalletBalance).toHaveBeenCalledWith(
        "wallet-1",
        expect.any(Object),
      );
    });

    it("should throw RecordNotFoundError if assignment does not exist", () => {
      feeAssignmentRepo.findById.mockReturnValue(null);

      expect(() => service.executePayment(validPayload)).toThrow(
        RecordNotFoundError,
      );
    });

    it("should throw BusinessRuleError if assignment lacks configuration ID", () => {
      feeAssignmentRepo.findById.mockReturnValue({
        assignmentId: "assign-1",
        feeConfigId: null,
      });

      expect(() => service.executePayment(validPayload)).toThrow(
        BusinessRuleError,
      );
    });

    it("should throw RecordNotFoundError if configuration does not exist", () => {
      feeAssignmentRepo.findById.mockReturnValue({
        assignmentId: "assign-1",
        feeConfigId: "config-1",
      });
      feeConfigRepo.findById.mockReturnValue(null);

      expect(() => service.executePayment(validPayload)).toThrow(
        RecordNotFoundError,
      );
    });

    it("should throw OverpaymentError if payment exceeds remaining debt", () => {
      feeAssignmentRepo.findById.mockReturnValue({
        assignmentId: "assign-1",
        feeConfigId: "config-1",
        amountPaid: 450,
      });
      feeConfigRepo.findById.mockReturnValue({
        feeConfigId: "config-1",
        totalAmount: 500,
        currency: CURRENCY_ENUM.USD,
      });
      rateService.computeExchangeRate.mockReturnValue({
        amountConverted: 100,
        exchangeRateMultiplied: 1,
      });

      expect(() => service.executePayment(validPayload)).toThrow(
        OverpaymentError,
      );
    });
  });

  describe("cancelPayment", () => {
    it("should cancel payment successfully when nominal case", () => {
      studentPaymentRepo.findById.mockReturnValue({
        paymentId: "pay-1",
        assignmentId: "assign-1",
        amountConverted: 100,
        status: PAYMENT_STATUS_ENUM.VALIDATED,
      });
      feeAssignmentRepo.findById.mockReturnValue({
        assignmentId: "assign-1",
        feeConfigId: "config-1",
      });
      feeConfigRepo.findById.mockReturnValue({
        feeConfigId: "config-1",
        totalAmount: 500,
        wallet: { walletId: "wallet-1" },
      });
      studentPaymentRepo.cancelPayment.mockReturnValue({
        paymentId: "pay-1",
        status: PAYMENT_STATUS_ENUM.CANCELED,
      });
      feeAssignmentRepo.revertAssignmentProgress.mockReturnValue({
        assignmentId: "assign-1",
        amountPaid: 0,
      });

      const result = service.cancelPayment("pay-1");

      expect(result).toBeDefined();
      expect(result.payment.status).toBe(PAYMENT_STATUS_ENUM.CANCELED);
      expect(studentPaymentRepo.cancelPayment).toHaveBeenCalled();
      expect(walletRepo.updateWalletBalance).toHaveBeenCalledWith(
        "wallet-1",
        expect.any(Object),
      );
    });

    it("should throw RecordNotFoundError if payment does not exist", () => {
      studentPaymentRepo.findById.mockReturnValue(null);

      expect(() => service.cancelPayment("pay-invalid")).toThrow(
        RecordNotFoundError,
      );
    });

    it("should throw BusinessRuleError if payment is already canceled", () => {
      studentPaymentRepo.findById.mockReturnValue({
        paymentId: "pay-1",
        status: PAYMENT_STATUS_ENUM.CANCELED,
      });

      expect(() => service.cancelPayment("pay-1")).toThrow(BusinessRuleError);
    });
  });
});
