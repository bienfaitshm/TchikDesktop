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
} from "./enrollment.repository";
import { SelectOptionFacade } from "@/packages/drizzle-queries";

export class EnrollmentService {
  public readonly enrollmentSelectService: SelectOptionFacade<EnrollmentDTO>;

  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly userRepo: UserRepository,
    private readonly tutorService: TutorService,
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
          return { ...baseOption, ...originalItem };
        },
      },
    );
  }

  getOptions(filters: BaseClassroomEnrollmentFilters) {
    return this.enrollmentSelectService.loadOptions(filters);
  }

  private validateContext(
    schoolId?: string,
    yearId?: string,
  ): asserts schoolId is string {
    if (!schoolId || !yearId) {
      throw new Error("Missing Context: schoolId and yearId are required.");
    }
  }

  async getDashboardMetrics(filters: { schoolId: string; yearId: string }) {
    this.validateContext(filters.schoolId, filters.yearId);
    return this.enrollmentRepo.getDashboardMetrics(filters);
  }

  async getCountByClass(filters: { schoolId: string; yearId: string }) {
    this.validateContext(filters.schoolId, filters.yearId);
    return this.enrollmentRepo.getCountByClass(filters);
  }

  /**
   * Processus transactionnel de création rapide
   */
  quickCreate({ studentData, tutorData, ...payload }: EnrollmentQuickCreate) {
    this.validateContext(payload.schoolId, payload.yearId);

    return this.clientDb.transaction((tx) => {
      let targetStudentId: string;
      let targetTutorId: string | null = null;

      // 1. GESTION ÉLÈVE
      if (studentData.isInSystem) {
        targetStudentId = studentData.studentId;
      } else {
        const student = this.userRepo.createStudent(
          {
            ...studentData.student,
            birthDate: studentData.student.birthDate!,
            schoolId: payload.schoolId,
          },
          tx,
        );

        targetStudentId = student.userId;
      }

      // 2. GESTION TUTEUR
      if (tutorData?.isTutorInSystem === true) {
        targetTutorId = tutorData.tutorId;
      } else if (tutorData?.isTutorInSystem === false) {
        const tutor = this.tutorService.createTutor(
          { ...tutorData.tutor, schoolId: payload.schoolId },
          tx,
        );
        targetTutorId = tutor.tutorId;
      }

      // 3. CRÉATION DE L'INSCRIPTION
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

      // 4. PAIEMENT / FRAIS (Décommenter et passer 'tx' une fois prêt)
      /*
    await this.paymentService.assignFeesToStudent({
      schoolId: payload.schoolId,
      yearId: payload.yearId,
      enrollmentId: enrollment.enrollmentId,
      classroomId: payload.classroomId,
      optionId: payload.optionId ?? null,
    }, tx);
    */

      return this.enrollmentRepo.findById(enrollment.enrollmentId);
    });
  }
}

export const enrollmentRepository = new EnrollmentRepository();
export const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  userRepository,
  tutorService,
);
