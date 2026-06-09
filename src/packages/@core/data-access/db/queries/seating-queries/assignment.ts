import { sql, eq, and, isNull } from "drizzle-orm";
import { db, TDataBase } from "../../config";
import { BaseRepository } from "../base-repository";
import {
  seatingAssignments,
  classroomEnrollments,
  classrooms,
  users,
  localrooms,
} from "../../schemas/schema";
import type {
  TSeatingAssignment,
  TSeatingAssignmentInsert,
} from "../../schemas/types";

import { getLogger } from "@/packages/logger";

export class SeatingAssignmentQuery extends BaseRepository<
  typeof seatingAssignments,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: seatingAssignments,
      idColumn: seatingAssignments.assignmentId,
      entityName: "SeatingAssignmen",
      logger: getLogger,
    });
  }

  /**
   * Plan de salle trié par ordre alphabétique des élèves.
   */
  async getRoomLayout(sessionId: string, localRoomId: string) {
    return this.db
      .select({
        assignmentId: seatingAssignments.assignmentId,
        row: seatingAssignments.rowPosition,
        column: seatingAssignments.columnPosition,
        enrollmentId: seatingAssignments.enrollmentId,
        classroom: {
          classId: classrooms.classId,
          identifier: classrooms.identifier,
          shortIdetifier: classrooms.shortIdentifier,
        },
        student: {
          firstName: users.firstName,
          lastName: users.lastName,
          middleName: users.middleName,
          gender: users.gender,
        },
      })
      .from(seatingAssignments)
      .innerJoin(
        classroomEnrollments,
        eq(seatingAssignments.enrollmentId, classroomEnrollments.enrollmentId),
      )
      .innerJoin(users, eq(classroomEnrollments.studentId, users.userId))
      .innerJoin(
        classrooms,
        eq(classroomEnrollments.classroomId, classrooms.classId),
      )
      .where(
        and(
          eq(seatingAssignments.sessionId, sessionId),
          eq(seatingAssignments.localRoomId, localRoomId),
        ),
      )
      .orderBy(
        sql`lower(${users.lastName})`,
        sql`lower(${users.lastName})`,
        sql`lower(${users.firstName})`,
      );
  }

  /**
   * Trouver un étudiant spécifique dans une session (ex: Un surveillant cherche un élève)
   */
  async findStudentSeat(sessionId: string, enrollmentId: string) {
    const [seat] = await this.db
      .select({
        roomName: localrooms.name,
        row: seatingAssignments.rowPosition,
        column: seatingAssignments.columnPosition,
      })
      .from(seatingAssignments)
      .innerJoin(
        localrooms,
        eq(seatingAssignments.localRoomId, localrooms.localRoomId),
      )
      .where(
        and(
          eq(seatingAssignments.sessionId, sessionId),
          eq(seatingAssignments.enrollmentId, enrollmentId),
        ),
      );
    return seat || null;
  }

  /**
   * Récupérer les élèves qui n'ont PAS ENCORE été placés pour cette session
   * Utilisation du pattern "LEFT JOIN ... WHERE right_side IS NULL"
   */
  async getUnassignedStudents(sessionId: string, yearId: string) {
    return this.db
      .select({
        enrollmentId: classroomEnrollments.enrollmentId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(classroomEnrollments)
      .innerJoin(users, eq(classroomEnrollments.studentId, users.userId))
      .leftJoin(
        seatingAssignments,
        and(
          eq(
            seatingAssignments.enrollmentId,
            classroomEnrollments.enrollmentId,
          ),
          eq(seatingAssignments.sessionId, sessionId),
        ),
      )
      .where(
        and(
          eq(classroomEnrollments.yearId, yearId),
          isNull(seatingAssignments.assignmentId),
        ),
      )
      .orderBy(sql`lower(${users.lastName})`);
  }

  /**
   * Vider une salle pour une session (Reset)
   */
  async clearRoomAssignments(sessionId: string, localRoomId: string) {
    try {
      await this.db
        .delete(seatingAssignments)
        .where(
          and(
            eq(seatingAssignments.sessionId, sessionId),
            eq(seatingAssignments.localRoomId, localRoomId),
          ),
        );
      return true;
    } catch (error) {
      this.logError("clearRoomAssignments", error, { sessionId, localRoomId });
      throw new Error("Impossible de vider la salle.");
    }
  }

  async bulkAssign(assignments: TSeatingAssignmentInsert[]) {
    if (assignments.length === 0) return [];
    return await db.transaction(async (tx) => {
      try {
        return await tx
          .insert(seatingAssignments)
          .values(assignments)
          .returning();
      } catch (error) {
        this.logError("bulkAssign", error, { count: assignments.length });
        throw new Error("Conflit : Une place ou un élève est déjà assigné.");
      }
    });
  }

  async deleteAssignmentsBySession(sessionId: string): Promise<boolean> {
    const result = await this.db
      .delete(seatingAssignments)
      .where(eq(seatingAssignments.sessionId, sessionId));
    return !!result;
  }

  /**
   * Remplace l'intégralité des assignations d'une session.
   * On supprime l'existant avant d'insérer les nouvelles données.
   */
  async rebuildAssignments(
    sessionId: string,
    assignments: TSeatingAssignmentInsert[],
  ): Promise<TSeatingAssignment[]> {
    if (assignments.length === 0) {
      return [];
    }

    const isDeletionSuccessful =
      await this.deleteAssignmentsBySession(sessionId);

    if (!isDeletionSuccessful) {
      throw new Error(`Failed to clear assignments for session: ${sessionId}`);
    }

    return this.bulkAssign(assignments);
  }
  static instance = new SeatingAssignmentQuery();
}
export const seatingAssignmentService = SeatingAssignmentQuery.instance;
