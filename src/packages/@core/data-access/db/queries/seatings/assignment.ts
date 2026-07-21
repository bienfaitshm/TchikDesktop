import { sql, eq, and, isNull } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
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
import { getLogger } from "@/packages/logger";
import { betterSqlite, helpers } from "@/packages/drizzle-queries";

const _seatingSessionJoinTables = {
  seatingAssignments,
} as const;

const SEATING_SESSION_DEFAULT_FILTERS: helpers.FindManyOptions<
  typeof _seatingSessionJoinTables
> = {};

/**
 * Repository for managing seating assignments and related database queries.
 */
export class SeatingAssignmentRepository extends betterSqlite.BaseRepository<
  TableSeatingAssignment,
  TDataBase
> {
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: seatingAssignments,
      idColumn: seatingAssignments.assignmentId,
      baseTableName: "seatingAssignments",
      logger: getLogger,
      defaultFilters: SEATING_SESSION_DEFAULT_FILTERS,
      joinTables: _seatingSessionJoinTables,
    });
  }

  /**
   * Retrieves the room layout sorted alphabetically by student names.
   * @param sessionId - Identifier of the seating session.
   * @param localroomId - Identifier of the local room.
   * @param tx - Optional transaction database client.
   * @returns Array of seating assignment details with student and classroom info.
   */
  getRoomLayout(sessionId: string, localroomId: string, tx?: TDataBase) {
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
      .orderBy(sql`lower(${users.lastName})`, sql`lower(${users.firstName})`)
      .all();
  }

  /**
   * Finds a specific student seat within a session.
   * @param sessionId - Identifier of the seating session.
   * @param enrollmentId - Identifier of the student enrollment.
   * @param tx - Optional transaction database client.
   * @returns The seat details or null if not found.
   */
  findStudentSeat(sessionId: string, enrollmentId: string, tx?: TDataBase) {
    const client = this.getClient(tx);
    const seat = client
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
      )
      .get();
    return seat ?? null;
  }

  /**
   * Retrieves students who have not yet been assigned a seat for the session.
   * @param sessionId - Identifier of the seating session.
   * @param yearId - Identifier of the academic year.
   * @param tx - Optional transaction database client.
   * @returns Array of unassigned student enrollment details.
   */
  getUnassignedStudents(sessionId: string, yearId: string, tx?: TDataBase) {
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
      .orderBy(sql`lower(${users.lastName})`)
      .all();
  }

  /**
   * Clears all room assignments for a given session.
   * @param sessionId - Identifier of the seating session.
   * @param localroomId - Identifier of the local room.
   * @param tx - Optional transaction database client.
   * @returns True if successful.
   */
  clearRoomAssignments(sessionId: string, localroomId: string, tx?: TDataBase) {
    try {
      const client = this.getClient(tx);
      client
        .delete(seatingAssignments)
        .where(
          and(
            eq(seatingAssignments.sessionId, sessionId),
            eq(seatingAssignments.localroomId, localroomId),
          ),
        )
        .run();
      return true;
    } catch (error) {
      this.logError("clearRoomAssignments", error, { sessionId, localroomId });
      throw new Error("Failed to clear room assignments.");
    }
  }

  /**
   * Performs a bulk insertion of seating assignments.
   * @param assignments - Array of assignments to insert.
   * @param tx - Optional transaction database client.
   * @returns Array of inserted seating assignments.
   */
  async bulkAssign(assignments: InsertSeatingAssignment[], tx?: TDataBase) {
    if (assignments.length === 0) return [];

    const client = this.getClient(tx);

    try {
      return await client
        .insert(seatingAssignments)
        .values(assignments)
        .returning();
    } catch (error) {
      this.logError("bulkAssign", error, { count: assignments.length });
      throw new Error(
        "Placement conflict: A seat or a student is already assigned.",
      );
    }
  }

  /**
   * Deletes all assignments associated with a session.
   * @param sessionId - Identifier of the seating session.
   * @param tx - Optional transaction database client.
   * @returns True if at least one assignment was deleted.
   */
  deleteAssignmentsBySession(sessionId: string, tx?: TDataBase): boolean {
    const client = this.getClient(tx);
    const result = client
      .delete(seatingAssignments)
      .where(eq(seatingAssignments.sessionId, sessionId))
      .returning()
      .get();
    return !!result;
  }

  /**
   * Replaces all assignments for a session within a single isolated transaction.
   * @param sessionId - Identifier of the seating session.
   * @param assignments - New array of seating assignments.
   * @param tx - Optional transaction database client.
   * @returns Array of newly created seating assignments.
   */
  async rebuildAssignments(
    sessionId: string,
    assignments: InsertSeatingAssignment[],
    tx?: TDataBase,
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
