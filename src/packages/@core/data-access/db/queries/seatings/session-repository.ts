import { sql, eq, and, count, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  seatingAssignments,
  seatingSessions,
  localrooms,
} from "@/packages/@core/data-access/db/schemas";
import { compareByFullName } from "@/packages/@core/data-access/db/queries/query-utils";
import type { SeatingSessionWithAssignment } from "./type";
import {
  helpers,
  betterSqlite,
  DatabaseError,
} from "@/packages/drizzle-queries";

const _seatingSessionJoinTables = {
  seatingAssignments,
  seatingSessions,
} as const;

export type BaseSeatingSessionFilters = helpers.FindManyOptions<
  typeof _seatingSessionJoinTables
>;

const SESSION_SORT: BaseSeatingSessionFilters = {
  orderBy: [{ table: "seatingSessions", column: "sessionName", order: "asc" }],
};

/**
 * Repository for managing seating sessions and related analytical room status queries.
 */
export class SeatingSessionRepository extends betterSqlite.BaseRepository<
  typeof seatingSessions,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: seatingSessions,
      idColumn: seatingSessions.sessionId,
      baseTableName: "seatingSessions",
      logger: getLogger,
      defaultFilters: SESSION_SORT,
      joinTables: _seatingSessionJoinTables,
    });
  }

  /**
   * Overrides the default query set to include computed assignment status flags.
   * @param tx - Optional transaction client.
   * @returns Dynamic select query builder.
   */
  override getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        hasAssignments:
          sql`count(${seatingAssignments.assignmentId}) > 0`.mapWith(Boolean),
      })
      .from(this.table)
      .leftJoin(
        seatingAssignments,
        eq(seatingAssignments.sessionId, this.table.sessionId),
      )
      .groupBy(this.table.sessionId)
      .$dynamic();
  }

  /**
   * Retrieves the occupancy status of rooms for a specific seating session.
   * @param sessionId - Identifier of the seating session.
   * @param tx - Optional transaction client.
   * @returns Array of room status metrics including occupancy rates.
   */
  async getSessionRoomsStatus(sessionId: string, tx?: TDataBase) {
    if (!sessionId) return [];

    try {
      const client = this.getClient(tx);
      return await client
        .select({
          localroomId: localrooms.localroomId,
          roomName: localrooms.name,
          maxCapacity: localrooms.maxCapacity,
          assignedCount: count(seatingAssignments.assignmentId),
          occupancyRate: sql<number>`
            CAST(COUNT(${seatingAssignments.assignmentId}) AS FLOAT) / NULLIF(${localrooms.maxCapacity}, 0) * 100
          `,
        })
        .from(localrooms)
        .innerJoin(
          seatingAssignments,
          and(
            eq(seatingAssignments.localroomId, localrooms.localroomId),
            eq(seatingAssignments.sessionId, sessionId),
          ),
        )
        .groupBy(
          localrooms.localroomId,
          localrooms.name,
          localrooms.maxCapacity,
        )
        .orderBy(localrooms.name);
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to retrieve room status.",
      );
      this.logError("clearRoomAssignments", dbError, {
        sessionId,
      });
      throw dbError;
    }
  }

  /**
   * Retrieves a seating session with all associated assignments and nested relations.
   * @param sessionId - Identifier of the seating session.
   * @param tx - Optional transaction client.
   * @returns The session details with sorted assignments or null if not found.
   */
  async getSessionWithAssignments(
    sessionId: string,
    tx?: TDataBase,
  ): Promise<SeatingSessionWithAssignment | null> {
    try {
      const client = this.getClient(tx);
      const sessionDetails = await client.query.seatingSessions.findFirst({
        where: eq(seatingSessions.sessionId, sessionId),
        with: {
          assignments: {
            with: {
              localroom: true,
              enrollment: {
                with: {
                  student: true,
                  classroom: true,
                },
              },
            },
          },
        },
      });

      if (!sessionDetails) return null;

      const typedSession =
        sessionDetails as unknown as SeatingSessionWithAssignment;

      if (typedSession.assignments) {
        typedSession.assignments.sort(
          compareByFullName((assignment) => assignment.enrollment.student),
        );
      }

      return typedSession;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to retrieve room with students.",
      );
      this.logError("clearRoomAssignments", dbError, {
        sessionId,
      });
      throw dbError;
    }
  }
}

export const seatingSessionRepository = new SeatingSessionRepository();
