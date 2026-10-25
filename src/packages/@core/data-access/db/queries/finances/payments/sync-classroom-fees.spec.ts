import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeeManagementService } from "./sync-classroom-fees";
import { BusinessRuleError } from "./errors";
import {
  FEE_SCHEDULE_STATUS_ENUM,
  SECTION_ENUM,
} from "@/packages/@core/data-access/db/options";

describe("FeeManagementService", () => {
  let classroomRepo: any;
  let enrollmentRepo: any;
  let feeConfigRepo: any;
  let feeAssignmentRepo: any;
  let clientDb: any;
  let logger: any;
  let service: FeeManagementService;

  beforeEach(() => {
    classroomRepo = {
      findById: vi.fn(),
    };
    enrollmentRepo = {
      getActiveEnrollments: vi.fn(),
      findById: vi.fn(),
    };
    feeConfigRepo = {
      findApplicableConfigurations: vi.fn(),
    };
    feeAssignmentRepo = {
      getEnrollmentAssignments: vi.fn(),
      bulkCreate: vi.fn(),
      assignFees: vi.fn(),
      findMany: vi.fn(),
    };
    clientDb = {};
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    service = new FeeManagementService(
      classroomRepo,
      enrollmentRepo,
      feeConfigRepo,
      feeAssignmentRepo,
      clientDb,
      logger,
    );
  });

  describe("syncClassroomFeeAssignments", () => {
    it("should abort and return empty arrays if classroom is not found", async () => {
      classroomRepo.findById.mockResolvedValue(null);

      const result = await service.syncClassroomFeeAssignments({
        schoolId: "school-1",
        yearId: "year-1",
        classId: "class-1",
      });

      expect(result).toEqual({ configs: [], enrollments: [] });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Classroom class-1 not found."),
      );
    });

    it("should return empty arrays when no enrollments or configurations are found", async () => {
      classroomRepo.findById.mockResolvedValue({
        classId: "class-1",
        optionId: "opt-1",
        section: SECTION_ENUM.PRIMARY,
      });
      enrollmentRepo.getActiveEnrollments.mockResolvedValue([]);
      feeConfigRepo.findApplicableConfigurations.mockResolvedValue([]);

      const result = await service.syncClassroomFeeAssignments({
        schoolId: "school-1",
        yearId: "year-1",
        classId: "class-1",
      });

      expect(result).toEqual({ configs: [], enrollments: [] });
    });

    it("should successfully sync and create missing assignments when enrollments and configs exist", async () => {
      const classroom = {
        classId: "class-1",
        optionId: "opt-1",
        section: SECTION_ENUM.PRIMARY,
      };
      classroomRepo.findById.mockResolvedValue(classroom);

      const enrollments = [{ enrollmentId: "enr-1" }];
      enrollmentRepo.getActiveEnrollments.mockResolvedValue(enrollments);

      const configs = [
        {
          feeConfigId: "cfg-1",
          feeType: {
            feeTypeId: "ft-1",
            name: "Tuition",
            schedules: [
              {
                scheduleId: "sch-1",
                installmentName: "Term 1",
                totalAmount: 100,
                currency: "USD",
              },
            ],
          },
        },
      ];
      feeConfigRepo.findApplicableConfigurations.mockResolvedValue(configs);
      feeAssignmentRepo.getEnrollmentAssignments.mockResolvedValue([]);
      feeAssignmentRepo.assignFees.mockResolvedValue(undefined);

      const result = await service.syncClassroomFeeAssignments({
        schoolId: "school-1",
        yearId: "year-1",
        classId: "class-1",
      });

      expect(result).toEqual({ configs, enrollments });
      expect(feeAssignmentRepo.assignFees).toHaveBeenCalledTimes(1);
    });

    it("should wrap and throw DatabaseError on unexpected errors", async () => {
      classroomRepo.findById.mockRejectedValue(new Error("DB failure"));

      await expect(
        service.syncClassroomFeeAssignments({
          schoolId: "school-1",
          yearId: "year-1",
          classId: "class-1",
        }),
      ).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("assignFees", () => {
    it("should return configurations directly if enrollments or configs are empty", async () => {
      feeConfigRepo.findApplicableConfigurations.mockResolvedValue([]);

      const res = await service.assignFees([], {
        schoolId: "school-1",
        yearId: "year-1",
        classroomId: "class-1",
        optionId: null,
        section: null,
      });

      expect(res).toEqual([]);
    });

    it("should process and create assignments when inputs are valid", async () => {
      const configs = [
        {
          feeConfigId: "cfg-1",
          feeType: {
            feeTypeId: "ft-1",
            name: "Tuition",
            schedules: [
              {
                scheduleId: "sch-1",
                installmentName: "Term 1",
                totalAmount: 100,
                currency: "USD",
              },
            ],
          },
        },
      ];
      feeConfigRepo.findApplicableConfigurations.mockResolvedValue(configs);
      feeAssignmentRepo.getEnrollmentAssignments.mockResolvedValue([]);
      feeAssignmentRepo.bulkCreate.mockResolvedValue(undefined);

      console.log("service.assignFees valid", service.assignFees);

      const res = await service.assignFees([{ enrollmentId: "enr-1" }], {
        schoolId: "school-1",
        yearId: "year-1",
        classroomId: "class-1",
        optionId: null,
        section: null,
      });

      expect(res).toEqual(configs);
      expect(feeAssignmentRepo.assignFees).toHaveBeenCalled();
    });
  });

  describe("getPaymentMapped", () => {
    it("should return empty array when configs are undefined or empty", () => {
      const result = service.getPaymentMapped([], undefined);
      expect(result).toEqual([]);
    });

    it("should map fee types and merge existing assignments correctly", () => {
      const configs = [
        {
          feeConfigId: "cfg-1",
          feeType: {
            feeTypeId: "ft-1",
            name: "Tuition",
            schedules: [
              {
                scheduleId: "sch-1",
                installmentName: "Term 1",
                totalAmount: 100,
                currency: "USD",
              },
            ],
          },
        },
      ];
      const assignments = [
        {
          feeAssignmentId: "asg-1",
          enrollmentId: "enr-1",
          feeConfigId: "cfg-1",
          scheduleId: "sch-1",
          totalAmount: 100,
          amountPaid: 50,
          status: FEE_SCHEDULE_STATUS_ENUM.PARTIALLY_PAID,
          currency: "USD",
        },
      ];

      const result = service.getPaymentMapped(assignments, configs as any);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe("ft-1");
      expect(result[0].schedules[0].amountPaid).toBe(50);
      expect(result[0].schedules[0].status).toBe(
        FEE_SCHEDULE_STATUS_ENUM.PARTIALLY_PAID,
      );
    });
  });

  describe("getStudentPaymentOverview", () => {
    it("should throw BusinessRuleError when enrollment is not found", async () => {
      enrollmentRepo.findById.mockResolvedValue(null);

      await expect(
        service.getStudentPaymentOverview("invalid-id"),
      ).rejects.toThrow(BusinessRuleError);
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return student payment overview successfully when enrollment exists", async () => {
      const enrollment = {
        enrollmentId: "enr-1",
        classroomId: "class-1",
        schoolId: "school-1",
        yearId: "year-1",
        classroom: {
          optionId: "opt-1",
          section: SECTION_ENUM.PRIMARY,
        },
      };
      enrollmentRepo.findById.mockResolvedValue(enrollment);

      const configs = [
        {
          feeConfigId: "cfg-1",
          feeType: {
            feeTypeId: "ft-1",
            name: "Tuition",
            schedules: [
              {
                scheduleId: "sch-1",
                installmentName: "Term 1",
                totalAmount: 100,
                currency: "USD",
              },
            ],
          },
        },
      ];
      feeConfigRepo.findApplicableConfigurations.mockResolvedValue(configs);
      feeAssignmentRepo.getEnrollmentAssignments.mockResolvedValue([]);
      feeAssignmentRepo.findMany.mockResolvedValue([]);
      feeAssignmentRepo.bulkCreate.mockResolvedValue(undefined);

      const overview = await service.getStudentPaymentOverview("enr-1");

      expect(overview).toEqual({
        enrollment,
        payments: expect.any(Array),
      });
      expect(overview.payments).toHaveLength(1);
    });
  });
});
