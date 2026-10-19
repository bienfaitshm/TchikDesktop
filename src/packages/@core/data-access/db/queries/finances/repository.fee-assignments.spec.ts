import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculatePaymentStatus, FeeAssignmentRepository } from "./index";
import { FEE_SCHEDULE_STATUS_ENUM } from "@/packages/@core/data-access/db/options";
import { DatabaseError } from "@/packages/drizzle-queries";

describe("calculatePaymentStatus", () => {
  it("should return PAID when amount equals totalAmount", () => {
    expect(calculatePaymentStatus(100, 100)).toBe(
      FEE_SCHEDULE_STATUS_ENUM.PAID,
    );
  });

  it("should return OVERPAID when amount exceeds totalAmount", () => {
    expect(calculatePaymentStatus(120, 100)).toBe(
      FEE_SCHEDULE_STATUS_ENUM.OVERPAID,
    );
  });

  it("should return UNPAID when amount is zero or negative", () => {
    expect(calculatePaymentStatus(0, 100)).toBe(
      FEE_SCHEDULE_STATUS_ENUM.UNPAID,
    );
    expect(calculatePaymentStatus(-10, 100)).toBe(
      FEE_SCHEDULE_STATUS_ENUM.UNPAID,
    );
  });

  it("should return PARTIALLY_PAID when amount is between zero and totalAmount", () => {
    expect(calculatePaymentStatus(50, 100)).toBe(
      FEE_SCHEDULE_STATUS_ENUM.PARTIALLY_PAID,
    );
  });
});

describe("FeeAssignmentRepository", () => {
  let repository: FeeAssignmentRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {};
    repository = new FeeAssignmentRepository(mockDb);
  });

  describe("getEnrollmentAssignments", () => {
    it("should return an empty array immediately if enrollmentIds is empty", () => {
      const findManySpy = vi.spyOn(repository, "findMany").mockReturnValue([]);
      const result = repository.getEnrollmentAssignments([]);

      expect(result).toEqual([]);
      expect(findManySpy).not.toHaveBeenCalled();
    });

    it("should call findMany with correct filters when enrollmentIds are provided", () => {
      const mockAssignments = [{ assignmentId: "1" }] as any;
      const findManySpy = vi
        .spyOn(repository, "findMany")
        .mockReturnValue(mockAssignments);

      const result = repository.getEnrollmentAssignments(["enrol-1"]);

      expect(result).toEqual(mockAssignments);
      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          feeAssignments: { enrollmentId: { $in: ["enrol-1"] } },
        },
        limit: 20000,
      });
    });
  });

  describe("updatePendingSchedules", () => {
    it("should return early if assignmentIds is empty", () => {
      const updateSpy = vi.spyOn(repository, "update").mockReturnValue([]);
      repository.updatePendingSchedules([], 100);

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it("should perform update when valid IDs are provided", () => {
      const updateSpy = vi.spyOn(repository, "update").mockReturnValue([]);
      repository.updatePendingSchedules(["assign-1"], 150);

      expect(updateSpy).toHaveBeenCalledWith(
        { totalAmount: 150 },
        { where: { feeAssignments: { assignmentId: { $in: ["assign-1"] } } } },
        mockDb,
      );
    });

    it("should catch errors and throw a DatabaseError", () => {
      vi.spyOn(repository, "update").mockImplementation(() => {
        throw new Error("DB error");
      });
      vi.spyOn(repository as any, "logError").mockImplementation(() => {});

      expect(() =>
        repository.updatePendingSchedules(["assign-1"], 150),
      ).toThrow(DatabaseError);
    });
  });

  describe("getAssignmentAmount", () => {
    it("should return amountPaid and totalAmount when record is found", () => {
      vi.spyOn(repository, "findById").mockReturnValue({
        amountPaid: 40,
        totalAmount: 100,
      } as any);

      const result = repository.getAssignmentAmount("assign-1");
      expect(result).toEqual({ amountPaid: 40, totalAmount: 100 });
    });

    it("should throw DatabaseError when record is not found", () => {
      vi.spyOn(repository, "findById").mockReturnValue(null);

      expect(() => repository.getAssignmentAmount("non-existent")).toThrow(
        DatabaseError,
      );
    });
  });
});
