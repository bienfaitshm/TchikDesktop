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
} from "@/packages/@core/data-access/db/options";

vi.mock("./utils", () => ({
  validateContext: vi.fn(),
}));

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
    feeConfigRepo = { findById: vi.fn() };
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
    rateService = { computeExchangeRate: vi.fn() };
    walletRepo = { updateWalletBalance: vi.fn() };
    clientDb = {
      transaction: vi.fn((cb) => cb({})),
    };
    logger = { info: vi.fn(), error: vi.fn() };

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

  describe("execute", () => {
    const payload = {
      schoolId: "school-1",
      yearId: "year-1",
      assignmentId: "asg-1",
      amountReceived: 100,
      currencyReceived: CURRENCY_ENUM.USD,
    };

    it("should successfully process a payment under valid conditions", () => {
      const assignment = {
        assignmentId: "asg-1",
        feeConfigId: "cfg-1",
        amountPaid: 0,
      };
      const config = {
        feeConfigId: "cfg-1",
        totalAmount: 200,
        currency: CURRENCY_ENUM.USD,
        wallet: { walletId: "w-1" },
      };
      const createdPayment = {
        paymentId: "pay-1",
        assignmentId: "asg-1",
        amountConverted: 100,
      };
      const updatedAssignment = { ...assignment, amountPaid: 100 };

      feeAssignmentRepo.findById.mockReturnValue(assignment);
      feeConfigRepo.findById.mockReturnValue(config);
      rateService.computeExchangeRate.mockReturnValue({
        amountConverted: 100,
        exchangeRateMultiplied: 1,
      });
      studentPaymentRepo.create.mockReturnValue(createdPayment);
      feeAssignmentRepo.updateAssignmentProgress.mockReturnValue(
        updatedAssignment,
      );

      const result = service.execute(payload);

      expect(result).toEqual({
        ...updatedAssignment,
        payment: createdPayment,
        feeConfig: config,
      });
      expect(walletRepo.updateWalletBalance).toHaveBeenCalledWith(
        "w-1",
        100,
        "INCREASE",
        expect.any(Object),
      );
    });

    it("should throw RecordNotFoundError if assignment does not exist", () => {
      feeAssignmentRepo.findById.mockReturnValue(null);

      expect(() => service.execute(payload)).toThrow(RecordNotFoundError);
    });

    it("should throw BusinessRuleError if assignment lacks config ID", () => {
      feeAssignmentRepo.findById.mockReturnValue({
        assignmentId: "asg-1",
        feeConfigId: null,
      });

      expect(() => service.execute(payload)).toThrow(BusinessRuleError);
    });

    it("should throw RecordNotFoundError if fee config does not exist", () => {
      feeAssignmentRepo.findById.mockReturnValue({
        assignmentId: "asg-1",
        feeConfigId: "cfg-1",
      });
      feeConfigRepo.findById.mockReturnValue(null);

      expect(() => service.execute(payload)).toThrow(RecordNotFoundError);
    });

    it("should throw OverpaymentError if payment exceeds remaining debt", () => {
      const assignment = {
        assignmentId: "asg-1",
        feeConfigId: "cfg-1",
        amountPaid: 150,
      };
      const config = {
        feeConfigId: "cfg-1",
        totalAmount: 200,
        currency: CURRENCY_ENUM.USD,
      };

      feeAssignmentRepo.findById.mockReturnValue(assignment);
      feeConfigRepo.findById.mockReturnValue(config);
      rateService.computeExchangeRate.mockReturnValue({
        amountConverted: 100,
        exchangeRateMultiplied: 1,
      });

      expect(() => service.execute(payload)).toThrow(OverpaymentError);
    });

    it("should wrap unexpected errors in TransactionError", () => {
      feeAssignmentRepo.findById.mockImplementation(() => {
        throw new Error("DB crash");
      });

      expect(() => service.execute(payload)).toThrow(TransactionError);
    });
  });

  describe("cancelPayment", () => {
    it("should successfully cancel a payment and revert assignment/wallet state", () => {
      const payment = {
        paymentId: "pay-1",
        assignmentId: "asg-1",
        amountConverted: 50,
        status: PAYMENT_STATUS_ENUM.PAID,
      };
      const assignment = { assignmentId: "asg-1", feeConfigId: "cfg-1" };
      const config = {
        feeConfigId: "cfg-1",
        totalAmount: 200,
        wallet: { walletId: "w-1" },
      };
      const canceledPayment = {
        ...payment,
        status: PAYMENT_STATUS_ENUM.CANCELED,
      };
      const updatedAssignment = { ...assignment, amountPaid: 0 };

      studentPaymentRepo.findById.mockReturnValue(payment);
      feeAssignmentRepo.findById.mockReturnValue(assignment);
      feeConfigRepo.findById.mockReturnValue(config);
      studentPaymentRepo.cancelPayment.mockReturnValue(canceledPayment);
      feeAssignmentRepo.revertAssignmentProgress.mockReturnValue(
        updatedAssignment,
      );

      const result = service.cancelPayment("pay-1");

      expect(result).toEqual({
        ...updatedAssignment,
        payment: canceledPayment,
        feeConfig: config,
      });
      expect(walletRepo.updateWalletBalance).toHaveBeenCalledWith(
        "w-1",
        50,
        "DECREASE",
        expect.any(Object),
      );
    });

    it("should throw RecordNotFoundError if payment does not exist", () => {
      studentPaymentRepo.findById.mockReturnValue(null);

      expect(() => service.cancelPayment("invalid-id")).toThrow(
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
