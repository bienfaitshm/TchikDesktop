import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudentPaymentService } from "./process-student-payment";
import {
  RecordNotFoundError,
  TransactionError,
} from "@/packages/drizzle-queries";
import { OverpaymentError, BusinessRuleError } from "./errors";
import {
  CURRENCY_ENUM,
  PAYMENT_STATUS_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";

describe("StudentPaymentService", () => {
  let feeAssignmentRepo: any;
  let studentPaymentRepo: any;
  let rateService: any;
  let walletRepo: any;
  let clientDb: any;
  let logger: any;
  let service: StudentPaymentService;

  beforeEach(() => {
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
      feeAssignmentRepo,
      studentPaymentRepo,
      rateService,
      walletRepo,
      clientDb,
      logger,
    );
  });

  describe("executePayment", () => {
    const payload = {
      schoolId: "school-1",
      yearId: "year-1",
      assignmentId: "assignment-1",
      amountReceived: 100,
      currencyReceived: CURRENCY_ENUM.USD,
      paymentMethod: PAYMENT_METHOD_ENUM.CASH,
    };

    it("should successfully process a payment within transaction", () => {
      const mockAssignment = {
        assignmentId: "assignment-1",
        totalAmount: 500,
        amountPaid: 100,
        currency: CURRENCY_ENUM.USD,
        feeType: { walletId: "wallet-1" },
      };

      feeAssignmentRepo.findById.mockReturnValue(mockAssignment);
      rateService.computeExchangeRate.mockReturnValue({
        amountConverted: 100,
        exchangeRateMultiplied: 1,
      });

      const mockPayment = { paymentId: "payment-1", amountConverted: 100 };
      studentPaymentRepo.create.mockReturnValue(mockPayment);

      const mockUpdatedAssignment = { ...mockAssignment, amountPaid: 200 };
      feeAssignmentRepo.updateAssignmentProgress.mockReturnValue(
        mockUpdatedAssignment,
      );

      const result = service.executePayment(payload);

      expect(clientDb.transaction).toHaveBeenCalled();
      expect(feeAssignmentRepo.findById).toHaveBeenCalledWith(
        "assignment-1",
        expect.any(Object),
      );
      expect(studentPaymentRepo.create).toHaveBeenCalled();
      expect(walletRepo.updateWalletBalance).toHaveBeenCalledWith(
        "wallet-1",
        expect.any(Object),
      );
      expect(result).toEqual({
        ...mockUpdatedAssignment,
        payment: mockPayment,
      });
    });

    it("should throw RecordNotFoundError if assignment does not exist", () => {
      feeAssignmentRepo.findById.mockReturnValue(null);

      expect(() => service.executePayment(payload)).toThrow(
        RecordNotFoundError,
      );
    });

    it("should throw OverpaymentError if payment exceeds remaining debt", () => {
      const mockAssignment = {
        assignmentId: "assignment-1",
        totalAmount: 200,
        amountPaid: 150,
        currency: CURRENCY_ENUM.USD,
        feeType: { walletId: "wallet-1" },
      };

      feeAssignmentRepo.findById.mockReturnValue(mockAssignment);
      rateService.computeExchangeRate.mockReturnValue({
        amountConverted: 100,
        exchangeRateMultiplied: 1,
      });

      expect(() => service.executePayment(payload)).toThrow(OverpaymentError);
    });

    it("should wrap unexpected errors in TransactionError", () => {
      feeAssignmentRepo.findById.mockImplementation(() => {
        throw new Error("DB crash");
      });

      expect(() => service.executePayment(payload)).toThrow(TransactionError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("cancelPayment", () => {
    const paymentId = "payment-1";

    it("should successfully cancel a payment and revert progress", () => {
      const mockPayment = {
        paymentId,
        assignmentId: "assignment-1",
        amountConverted: 100,
        status: PAYMENT_STATUS_ENUM.VALIDATED,
      };
      const mockAssignment = {
        assignmentId: "assignment-1",
        feeType: { walletId: "wallet-1" },
      };
      const canceledPayment = {
        ...mockPayment,
        status: PAYMENT_STATUS_ENUM.CANCELED,
      };
      const updatedAssignment = { assignmentId: "assignment-1", amountPaid: 0 };

      studentPaymentRepo.findById.mockReturnValue(mockPayment);
      feeAssignmentRepo.findById.mockReturnValue(mockAssignment);
      studentPaymentRepo.cancelPayment.mockReturnValue(canceledPayment);
      feeAssignmentRepo.revertAssignmentProgress.mockReturnValue(
        updatedAssignment,
      );

      const result = service.cancelPayment(paymentId);

      expect(clientDb.transaction).toHaveBeenCalled();
      expect(studentPaymentRepo.cancelPayment).toHaveBeenCalledWith(
        paymentId,
        expect.any(Object),
      );
      expect(feeAssignmentRepo.revertAssignmentProgress).toHaveBeenCalledWith(
        "assignment-1",
        100,
        expect.any(Object),
      );
      expect(walletRepo.updateWalletBalance).toHaveBeenCalledWith(
        "wallet-1",
        expect.any(Object),
      );
      expect(result).toEqual({
        ...updatedAssignment,
        payment: canceledPayment,
      });
    });

    it("should throw RecordNotFoundError if payment does not exist", () => {
      studentPaymentRepo.findById.mockReturnValue(null);

      expect(() => service.cancelPayment(paymentId)).toThrow(
        RecordNotFoundError,
      );
    });

    it("should throw BusinessRuleError if payment is already canceled", () => {
      const mockPayment = {
        paymentId,
        status: PAYMENT_STATUS_ENUM.CANCELED,
      };
      studentPaymentRepo.findById.mockReturnValue(mockPayment);

      expect(() => service.cancelPayment(paymentId)).toThrow(BusinessRuleError);
    });

    it("should throw BusinessRuleError if cancellation fails at repository level", () => {
      const mockPayment = {
        paymentId,
        assignmentId: "assignment-1",
        status: PAYMENT_STATUS_ENUM.VALIDATED,
      };
      studentPaymentRepo.findById.mockReturnValue(mockPayment);
      feeAssignmentRepo.findById.mockReturnValue({
        feeType: { walletId: "wallet-1" },
      });
      studentPaymentRepo.cancelPayment.mockReturnValue(null);

      expect(() => service.cancelPayment(paymentId)).toThrow(BusinessRuleError);
    });
  });
});
