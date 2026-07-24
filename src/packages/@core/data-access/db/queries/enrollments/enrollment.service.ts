import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import type { EnrollmentQuickCreate } from "@/packages/@core/data-access/schema-validations";
import {
  type UserRepository,
  userRepository,
} from "@/packages/@core/data-access/db/queries/users";
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
  quickCreate(payload: EnrollmentQuickCreate) {
    this.validateContext(payload.schoolId, payload.yearId);

    return this.clientDb.transaction((tx) => {
      let targetStudentId = payload.studentId;

      if (payload.student) {
        const newUser = this.userRepo.createUser(
          {
            lastName: payload.student.lastName,
            middleName: payload.student.middleName,
            schoolId: payload.schoolId,
          },
          tx,
        );

        targetStudentId = newUser.userId;
      }

      // Sécurité subsidiaire (Triggers si l'ID n'a pas pu être généré ou récupéré)
      if (!targetStudentId) {
        throw new Error(
          "Student ID unique requis pour finaliser l'inscription.",
        );
      }

      const enrollment = this.enrollmentRepo.create(
        {
          classroomId: payload.classroomId,
          schoolId: payload.schoolId,
          yearId: payload.yearId,
          status: payload.status,
          isNewStudent: payload.isNewStudent,
          studentId: targetStudentId,
        },
        tx,
      );

      // // APPEL DE L'ACTION DE PAIEMENT AUTOMATIQUE
      // this.paymentService.assignFeesToStudent({
      //   schoolId: payload.schoolId,
      //   yearId: payload.yearId,
      //   enrollmentId: enrollment.enrollmentId,
      //   classroomId: payload.classroomId,
      //   optionId: payload.optionId ?? null // Passe l'option de la classe pour le XOR
      // }, tx);

      return enrollment;
    });
  }
}

export const enrollmentRepository = new EnrollmentRepository();
export const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  userRepository,
);
