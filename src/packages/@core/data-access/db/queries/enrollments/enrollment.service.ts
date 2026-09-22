import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import type { EnrollmentQuickCreate } from "@/packages/@core/data-access/schema-validations";
import {
  type UserRepository,
  userRepository,
} from "@/packages/@core/data-access/db/queries/users";
import {
  type TutorService,
  tutorService,
} from "@/packages/@core/data-access/db/queries/tutors";
import {
  EnrollmentRepository,
  EnrollmentDTO,
  BaseClassroomEnrollmentFilters,
  enrollmentRepository,
} from "./enrollment.repository";
import {
  feeAssignmentRepository,
  FeeAssignmentRepository,
} from "@/packages/@core/data-access/db/queries/finances";
import { SelectOptionFacade } from "@/packages/drizzle-queries";
import { getLogger } from "@/packages/logger";

/**
 * Service managing classroom enrollment workflows, financial exemptions, and metrics.
 */
export class EnrollmentService {
  public readonly enrollmentSelectService: SelectOptionFacade<EnrollmentDTO>;
  public readonly logger = getLogger("EnrollmentService");

  /**
   * Initializes dependencies and configures the select option facade.
   * @param enrollmentRepo - Repository for enrollment data operations.
   * @param userRepo - Repository for user data operations.
   * @param tutorService - Service for tutor domain logic.
   * @param feeAssignment - Repository for fee assignment operations.
   * @param clientDb - Database client or active transaction.
   */
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly userRepo: UserRepository,
    private readonly tutorService: TutorService,
    private readonly feeAssignment: FeeAssignmentRepository,
    private readonly clientDb: TDataBase = db,
  ) {
    this.enrollmentSelectService = new SelectOptionFacade<EnrollmentDTO>(
      this.enrollmentRepo,
      {
        valueKey: "enrollmentId",
        labelKeyLong: ({ student }) =>
          student.fullName ?? `${student.lastName} ${student.middleName}`,
        labelKeyShort: ({ student }) => student.lastName,
        labelFormat: "long",
        transform(baseOption, originalItem) {
          return {
            ...baseOption,
            ...originalItem,
            description: `Class: ${originalItem.classroom.shortIdentifier} - Gender: ${originalItem.student.gender} - Code: ${originalItem.studentCode}`,
          };
        },
      },
    );
  }

  /**
   * Retrieves selection option items for UI components.
   * @param filters - Filtering parameters for classroom enrollments.
   * @returns Formatted options array.
   */
  public getOptions(filters: BaseClassroomEnrollmentFilters) {
    return this.enrollmentSelectService.loadOptions(filters);
  }

  /**
   * Asserts that required execution context fields are present.
   * @param filters - Object containing optional schoolId and yearId parameters.
   */
  private validateContext(filters: {
    schoolId?: string;
    yearId?: string;
  }): asserts filters is { schoolId: string; yearId: string } {
    if (!filters.schoolId || !filters.yearId) {
      throw new Error("Missing Context: schoolId and yearId are required.");
    }
  }

  /**
   * Fetches classroom metrics summary for the dashboard.
   * @param filters - Context filters containing schoolId and yearId.
   * @returns Aggregated metrics data.
   */
  public getDashboardMetrics(filters: { schoolId: string; yearId: string }) {
    this.validateContext(filters);
    return this.enrollmentRepo.getDashboardMetrics(filters);
  }

  /**
   * Fetches enrollment counts grouped by classroom.
   * @param filters - Context filters containing schoolId and yearId.
   * @returns Student counts grouped by classroom ID.
   */
  public getCountByClass(filters: { schoolId: string; yearId: string }) {
    this.validateContext(filters);
    return this.enrollmentRepo.getCountByClass(filters);
  }

  /**
   * Synchronously exempts students from fee assignments and marks them as Pro Deo.
   * @param schoolId - Unique identifier of the school.
   * @param enrollmentIds - Identifiers of target enrollments.
   * @param assignmentIds - Identifiers of fee assignments to exempt.
   * @returns Result of the update operation.
   */
  public markStudentsAsProDeo(
    schoolId: string,
    enrollmentIds: string[],
    assignmentIds: string[],
  ) {
    this.logger.info("Marking students as Pro Deo", {
      schoolId,
      enrollmentCount: enrollmentIds.length,
      assignmentCount: assignmentIds.length,
    });

    return this.clientDb.transaction((tx) => {
      this.feeAssignment.exemptStudentsFromFee(
        enrollmentIds,
        assignmentIds,
        tx,
      );
      return this.enrollmentRepo.markStudentsAsProDeo(
        enrollmentIds,
        schoolId,
        tx,
      );
    });
  }

  /**
   * Synchronously executes quick creation of student, tutor, and enrollment records within a transaction.
   * @param payload - Enrollment quick creation context and payload data.
   * @returns The newly created EnrollmentDTO instance.
   */
  public quickCreate({
    studentData,
    tutorData,
    ...payload
  }: EnrollmentQuickCreate) {
    this.validateContext(payload);

    this.logger.info("Starting quick enrollment creation", {
      schoolId: payload.schoolId,
      yearId: payload.yearId,
      classroomId: payload.classroomId,
      isNewStudent: payload.isNewStudent,
    });

    return this.clientDb.transaction((tx) => {
      let targetStudentId: string;
      let targetTutorId: string | null = null;

      if (studentData.isInSystem) {
        targetStudentId = studentData.studentId;
        this.logger.debug("Using existing student", {
          studentId: targetStudentId,
        });
      } else {
        const student = this.userRepo.createStudent(
          {
            ...studentData.student,
            birthDate: studentData.student.birthDate,
            schoolId: payload.schoolId,
          },
          tx,
        );
        targetStudentId = student.userId;
        this.logger.debug("Created new student", {
          studentId: targetStudentId,
        });
      }

      if (tutorData?.isTutorInSystem && Boolean(tutorData.tutorId)) {
        targetTutorId = tutorData.tutorId ?? null;
        this.logger.debug("Using existing tutor", { tutorId: targetTutorId });
      } else if (tutorData?.isTutorInSystem === false && tutorData.tutor) {
        const tutor = this.tutorService.createTutor(
          { ...tutorData.tutor, schoolId: payload.schoolId },
          tx,
        );
        targetTutorId = tutor.tutorId;
        this.logger.debug("Created new tutor", { tutorId: targetTutorId });
      }

      try {
        const enrollment = this.enrollmentRepo.create(
          {
            classroomId: payload.classroomId,
            schoolId: payload.schoolId,
            yearId: payload.yearId,
            status: payload.status,
            isNewStudent: payload.isNewStudent,
            studentId: targetStudentId,
            tutorId: targetTutorId,
          },
          tx,
        );

        const createdEnrollment = this.enrollmentRepo.findById(
          enrollment.enrollmentId,
          tx,
        );

        this.logger.info("Quick enrollment created successfully", {
          enrollmentId: enrollment.enrollmentId,
        });

        return createdEnrollment;
      } catch (error) {
        this.logger.error("Failed to execute quick enrollment transaction", {
          error,
          payload,
        });
        throw error;
      }
    });
  }
}

export const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  userRepository,
  tutorService,
  feeAssignmentRepository,
);
