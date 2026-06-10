import { sql, eq, and, isNull } from "drizzle-orm";
import { db } from "@/packages/@core/data-access/db/config";
import {
  seatingAssignments,
  classroomEnrollments,
  classrooms,
  users,
  localrooms,
  type TableSeatingAssignment,
  type SeatingAssignment,
  type InsertSeatingAssignment,
} from "@/packages/@core/data-access/db/schemas";
import { BaseRepository, type LibSqlClient } from "../base-repository";
import { getLogger } from "@/packages/logger";

export class SeatingAssignmentRepository extends BaseRepository<
  TableSeatingAssignment,
  LibSqlClient
> {
  constructor(database: LibSqlClient = db) {
    super({
      db: database,
      table: seatingAssignments,
      idColumn: seatingAssignments.assignmentId,
      entityName: "SeatingAssignment",
      logger: getLogger,
    });
  }

  /**
   * Plan de salle trié par ordre alphabétique des élèves.
   */
  async getRoomLayout(
    sessionId: string,
    localroomId: string,
    tx?: LibSqlClient,
  ) {
    const client = this.getClient(tx);
    return client
      .select({
        assignmentId: seatingAssignments.assignmentId,
        row: seatingAssignments.rowPosition,
        column: seatingAssignments.columnPosition,
        enrollmentId: seatingAssignments.enrollmentId,
        classroom: {
          classId: classrooms.classId,
          identifier: classrooms.identifier,
          shortIdentifier: classrooms.shortIdentifier,
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
          eq(seatingAssignments.localroomId, localroomId),
        ),
      )
      .orderBy(
        sql`lower(${users.lastName})`, // Suppression du doublon
        sql`lower(${users.firstName})`,
      );
  }

  /**
   * Trouver un étudiant spécifique dans une session.
   */
  async findStudentSeat(
    sessionId: string,
    enrollmentId: string,
    tx?: LibSqlClient,
  ) {
    const client = this.getClient(tx);
    const [seat] = await client
      .select({
        roomName: localrooms.name,
        row: seatingAssignments.rowPosition,
        column: seatingAssignments.columnPosition,
      })
      .from(seatingAssignments)
      .innerJoin(
        localrooms,
        eq(seatingAssignments.localroomId, localrooms.localroomId),
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
   * Récupérer les élèves qui n'ont PAS ENCORE été placés pour cette session.
   */
  async getUnassignedStudents(
    sessionId: string,
    yearId: string,
    tx?: LibSqlClient,
  ) {
    const client = this.getClient(tx);
    return client
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
   * Vider une salle pour une session.
   */
  async clearRoomAssignments(
    sessionId: string,
    localroomId: string,
    tx?: LibSqlClient,
  ) {
    try {
      const client = this.getClient(tx);
      await client
        .delete(seatingAssignments)
        .where(
          and(
            eq(seatingAssignments.sessionId, sessionId),
            eq(seatingAssignments.localroomId, localroomId),
          ),
        );
      return true;
    } catch (error) {
      this.logError("clearRoomAssignments", error, { sessionId, localroomId });
      throw new Error("Impossible de vider la salle.");
    }
  }

  /**
   * Insertion de masse d'assignations.
   */
  async bulkAssign(assignments: InsertSeatingAssignment[], tx?: LibSqlClient) {
    if (assignments.length === 0) return [];

    const client = this.getClient(tx);

    try {
      return await client
        .insert(seatingAssignments)
        .values(assignments as any)
        .returning();
    } catch (error) {
      this.logError("bulkAssign", error, { count: assignments.length });
      throw new Error(
        "Conflit de placement : Une place ou un élève est déjà assigné.",
      );
    }
  }

  async deleteAssignmentsBySession(
    sessionId: string,
    tx?: LibSqlClient,
  ): Promise<boolean> {
    const client = this.getClient(tx);
    const result = await client
      .delete(seatingAssignments)
      .where(eq(seatingAssignments.sessionId, sessionId));
    return !!result;
  }

  /**
   * Remplace l'intégralité des assignations d'une session.
   * Tout s'exécute au sein d'une seule et unique transaction isolée.
   */
  async rebuildAssignments(
    sessionId: string,
    assignments: InsertSeatingAssignment[],
    tx?: LibSqlClient,
  ): Promise<SeatingAssignment[]> {
    if (assignments.length === 0) {
      return [];
    }

    const baseClient = this.getClient(tx);

    return await baseClient.transaction(async (innerTx) => {
      const isDeletionSuccessful = await this.deleteAssignmentsBySession(
        sessionId,
        innerTx,
      );

      if (!isDeletionSuccessful) {
        throw new Error(
          `Failed to clear assignments for session: ${sessionId}`,
        );
      }

      return await this.bulkAssign(assignments, innerTx);
    });
  }
}

export const seatingAssignmentRepository = new SeatingAssignmentRepository();
