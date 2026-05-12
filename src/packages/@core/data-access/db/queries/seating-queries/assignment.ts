import { sql, eq, and, isNull } from "drizzle-orm";
import { db } from "../../config";
import { BaseRepository } from "../base-repository.new";
import {
  seatingAssignments,
  classroomEnrolements,
  users,
  localRooms,
} from "../../schemas/schema";
import type {
  TSeatingAssignment,
  TSeatingAssignmentInsert,
  TSeatingAssignmentUpdate,
} from "../../schemas/types";

import { getLogger } from "@/packages/logger";

const logger = getLogger("Database-Repository");

export class SeatingAssignmentQuery extends BaseRepository<
  typeof seatingAssignments,
  TSeatingAssignment,
  TSeatingAssignmentInsert,
  TSeatingAssignmentUpdate
> {
  constructor() {
    super(
      db,
      logger,
      seatingAssignments,
      seatingAssignments.assignmentId,
      "SeatingAssignment",
      {},
    );
  }

  /**
   * Plan de salle trié par ordre alphabétique des élèves.
   */
  async getRoomLayout(sessionId: string, localRoomId: string) {
    return (
      db
        .select({
          assignmentId: seatingAssignments.assignmentId,
          row: seatingAssignments.rowPosition,
          column: seatingAssignments.columnPosition,
          enrolementId: seatingAssignments.enrolementId,
          student: {
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(seatingAssignments)
        .innerJoin(
          classroomEnrolements,
          eq(
            seatingAssignments.enrolementId,
            classroomEnrolements.enrolementId,
          ),
        )
        .innerJoin(users, eq(classroomEnrolements.studentId, users.userId))
        .where(
          and(
            eq(seatingAssignments.sessionId, sessionId),
            eq(seatingAssignments.localRoomId, localRoomId),
          ),
        )
        // AJOUT : Tri par nom de famille puis prénom
        .orderBy(sql`lower(${users.lastName})`, sql`lower(${users.firstName})`)
    );
  }

  /**
   * Trouver un étudiant spécifique dans une session (ex: Un surveillant cherche un élève)
   */
  async findStudentSeat(sessionId: string, enrolementId: string) {
    const [seat] = await db
      .select({
        roomName: localRooms.name,
        row: seatingAssignments.rowPosition,
        column: seatingAssignments.columnPosition,
      })
      .from(seatingAssignments)
      .innerJoin(
        localRooms,
        eq(seatingAssignments.localRoomId, localRooms.localRoomId),
      )
      .where(
        and(
          eq(seatingAssignments.sessionId, sessionId),
          eq(seatingAssignments.enrolementId, enrolementId),
        ),
      );
    return seat || null;
  }

  /**
   * Récupérer les élèves qui n'ont PAS ENCORE été placés pour cette session
   * Utilisation du pattern "LEFT JOIN ... WHERE right_side IS NULL"
   */
  async getUnassignedStudents(sessionId: string, yearId: string) {
    return db
      .select({
        enrolementId: classroomEnrolements.enrolementId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(classroomEnrolements)
      .innerJoin(users, eq(classroomEnrolements.studentId, users.userId))
      .leftJoin(
        seatingAssignments,
        and(
          eq(
            seatingAssignments.enrolementId,
            classroomEnrolements.enrolementId,
          ),
          eq(seatingAssignments.sessionId, sessionId),
        ),
      )
      .where(
        and(
          eq(classroomEnrolements.yearId, yearId),
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
      await db
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

  static instance = new SeatingAssignmentQuery();
}
export const seatingAssignmentService = SeatingAssignmentQuery.instance;
