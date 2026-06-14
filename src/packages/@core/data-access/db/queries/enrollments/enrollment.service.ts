import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import type { EnrollmentQuickCreate } from "@/packages/@core/data-access/schema-validations";
import {
  type UserRepository,
  userRepository,
} from "@/packages/@core/data-access/db/queries/users";
import type { InsertUser } from "@/packages/@core/data-access/db/schemas";

import { EnrollmentRepository } from "./enrollment.repository";

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly userRepo: UserRepository,
    private readonly clientDb: TDataBase = db,
  ) {}

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
  async quickCreate(payload: EnrollmentQuickCreate) {
    this.validateContext(payload.schoolId, payload.yearId);

    return await this.clientDb.transaction(async (tx) => {
      let targetStudentId = payload.studentId;

      if (payload.student) {
        const newUser = await this.userRepo.createUser(
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

      return await this.enrollmentRepo.create(
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
    });
  }
}

export const enrollmentRepository = new EnrollmentRepository();
export const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  userRepository,
);
