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

/**
 * Service for managing classroom enrollment operations, metrics, and transactions.
 */
export class EnrollmentService {
  public readonly enrollmentSelectService: SelectOptionFacade<EnrollmentDTO>;

  /**
   * Initializes dependencies and configures the selection option facade.
   * @param enrollmentRepo - Repository for enrollment data access.
   * @param userRepo - Repository for user data access.
   * @param tutorService - Service for managing tutors.
   * @param feeAssignment - Repository for fee assignment operations.
   * @param clientDb - Database client connection or transaction.
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
   * Retrieves UI selection options for enrollments using provided filters.
   * @param filters - Filtration conditions for enrollments.
   * @returns List of formatted options for UI controls.
   */
  public getOptions(filters: BaseClassroomEnrollmentFilters) {
    return this.enrollmentSelectService.loadOptions(filters);
  }

  /**
   * Validates required execution context identifiers.
   * @param filters - Context containing schoolId and yearId.
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
   * Fetches dashboard metric aggregations for a given school and academic year.
   * @param filters - Context parameters containing schoolId and yearId.
   * @returns Calculated total, new, and existing student metrics.
   */
  public async getDashboardMetrics(filters: {
    schoolId: string;
    yearId: string;
  }) {
    this.validateContext(filters);
    return this.enrollmentRepo.getDashboardMetrics(filters);
  }

  /**
   * Retrieves student count metrics grouped by classroom.
   * @param filters - Context parameters containing schoolId and yearId.
   * @returns List of student counts per classroom.
   */
  public async getCountByClass(filters: { schoolId: string; yearId: string }) {
    this.validateContext(filters);
    return this.enrollmentRepo.getCountByClass(filters);
  }

  /**
   * Exempts students from fee assignments and marks them as Pro Deo in a transaction.
   * @param schoolId - Unique school identifier.
   * @param enrollmentIds - Array of enrollment identifiers to mark.
   * @param assignmentIds - Array of fee assignment identifiers to exempt.
   * @returns Result of the transaction update operation.
   */
  public async markStudentsAsProDeo(
    schoolId: string,
    enrollmentIds: string[],
    assignmentIds: string[],
  ) {
    return this.clientDb.transaction(async (tx) => {
      await this.feeAssignment.exemptStudentsFromFee(
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
   * Executes a transactional workflow to rapidly create or assign students and tutors.
   * @param payload - Data payload for quick enrollment creation.
   * @returns The created EnrollmentDTO entity with full relations.
   */
  public async quickCreate({
    studentData,
    tutorData,
    ...payload
  }: EnrollmentQuickCreate) {
    this.validateContext(payload);

    return this.clientDb.transaction(async (tx) => {
      let targetStudentId: string;
      let targetTutorId: string | null = null;

      if (studentData.isInSystem) {
        targetStudentId = studentData.studentId;
      } else {
        if (!studentData.student.birthDate) {
          throw new Error("Student birthDate is required for new entries.");
        }

        const student = await this.userRepo.createStudent(
          {
            ...studentData.student,
            birthDate: studentData.student.birthDate,
            schoolId: payload.schoolId,
          },
          tx,
        );

        targetStudentId = student.userId;
      }

      if (tutorData?.isTutorInSystem && tutorData.tutorId) {
        targetTutorId = tutorData.tutorId;
      } else if (tutorData?.isTutorInSystem === false && tutorData.tutor) {
        const tutor = await this.tutorService.createTutor(
          { ...tutorData.tutor, schoolId: payload.schoolId },
          tx,
        );
        targetTutorId = tutor.tutorId;
      }

      const enrollment = await this.enrollmentRepo.create(
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

      return this.enrollmentRepo.findById(enrollment.enrollmentId, tx);
    });
  }
}

export const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  userRepository,
  tutorService,
  feeAssignmentRepository,
);
