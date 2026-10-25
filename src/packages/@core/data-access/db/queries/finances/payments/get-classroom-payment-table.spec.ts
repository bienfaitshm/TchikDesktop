import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetClassroomPaymentTable } from "./get-classroom-payment-table";

vi.mock("./utils", () => ({
  buildAssignmentKey: (enrId: string, cfgId: string, schId: string) =>
    `${enrId}-${cfgId}-${schId}`,
}));

describe("GetClassroomPaymentTable", () => {
  let syncFees: any;
  let feeAssignmentRepo: any;
  let logger: any;
  let service: GetClassroomPaymentTable;

  beforeEach(() => {
    syncFees = {
      syncClassroomFeeAssignments: vi.fn(),
    };
    feeAssignmentRepo = {
      getEnrollmentAssignments: vi.fn(),
    };
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    service = new GetClassroomPaymentTable(syncFees, feeAssignmentRepo, logger);
  });

  describe("getClassroomPaymentTable", () => {
    it("should return an empty array if sync returns no enrollments or configurations", async () => {
      syncFees.syncClassroomFeeAssignments.mockResolvedValue({
        configs: [],
        enrollments: [],
      });

      const result = await service.getClassroomPaymentTable({
        schoolId: "school-1",
        yearId: "year-1",
        classId: "class-1",
      });

      expect(result).toEqual([]);
      expect(feeAssignmentRepo.getEnrollmentAssignments).not.toHaveBeenCalled();
    });

    it("should format and return the payment assignment table successfully when data exists", async () => {
      const configs = [
        {
          feeConfigId: "cfg-1",
          feeTypeId: "ft-1",
          feeType: {
            name: "Tuition",
            schedules: [{ scheduleId: "sch-1", installmentName: "Term 1" }],
          },
        },
      ];
      const enrollments = [
        {
          enrollmentId: "enr-1",
          student: { firstName: "John", lastName: "Doe" },
        },
      ];

      syncFees.syncClassroomFeeAssignments.mockResolvedValue({
        configs,
        enrollments,
      });

      const assignments = [
        {
          enrollmentId: "enr-1",
          feeConfigId: "cfg-1",
          scheduleId: "sch-1",
          totalAmount: 100,
          amountPaid: 50,
        },
      ];
      feeAssignmentRepo.getEnrollmentAssignments.mockReturnValue(assignments);

      const result = await service.getClassroomPaymentTable({
        schoolId: "school-1",
        yearId: "year-1",
        classId: "class-1",
      });

      expect(result).toHaveLength(1);
      expect(result[0].feeTypeId).toBe("ft-1");
      expect(result[0].name).toBe("Tuition");
      expect(result[0].table.head).toEqual([{ id: "sch-1", name: "Term 1" }]);
      expect(result[0].table.body).toHaveLength(1);
      expect(result[0].table.body[0].payments["sch-1"]).toEqual(assignments[0]);
    });

    it("should assign null to payment slots when specific assignments are missing", async () => {
      const configs = [
        {
          feeConfigId: "cfg-1",
          feeTypeId: "ft-1",
          feeType: {
            name: "Tuition",
            schedules: [{ scheduleId: "sch-1", installmentName: "Term 1" }],
          },
        },
      ];
      const enrollments = [
        {
          enrollmentId: "enr-1",
          student: { firstName: "Jane", lastName: "Doe" },
        },
      ];

      syncFees.syncClassroomFeeAssignments.mockResolvedValue({
        configs,
        enrollments,
      });

      feeAssignmentRepo.getEnrollmentAssignments.mockReturnValue([]);

      const result = await service.getClassroomPaymentTable({
        schoolId: "school-1",
        yearId: "year-1",
        classId: "class-1",
      });

      expect(result[0].table.body[0].payments["sch-1"]).toBeNull();
    });
  });
});
