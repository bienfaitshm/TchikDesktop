import { sql, eq, and, count, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import { BaseRepository, type LibSqlClient } from "../base-repository";
import {
  seatingAssignments,
  seatingSessions,
  localrooms,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { compareByFullName } from "@/packages/@core/data-access/db/queries/query-utils";
import type { SeatingSessionWithAssignment } from "./type";

const SESSION_SORT: FindManyOptions<typeof seatingSessions> = {
  orderBy: [{ column: "sessionName", order: "asc" }],
};

export class SeatingSessionRepository extends BaseRepository<
  typeof seatingSessions,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: seatingSessions,
      idColumn: seatingSessions.sessionId,
      entityName: "SeatingSession",
      logger: getLogger,
      defaultSort: SESSION_SORT,
    });
  }

  override getQuerySet(tx?: LibSqlClient) {
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

  async getSessionRoomsStatus(sessionId: string) {
    if (!sessionId) return [];

    try {
      return await this.db
        .select({
          localroomId: localrooms.localroomId,
          roomName: localrooms.name,
          maxCapacity: localrooms.maxCapacity,
          assignedCount: count(seatingAssignments.assignmentId),
          // Sécurisation contre la division par zéro via NULLIF en SQL
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
      this.logError("getSessionRoomsStatus", error, { sessionId });
      throw new Error("Impossible de récupérer l'état des salles.", {
        cause: error,
      });
    }
  }

  async getSessionWithAssignments(
    sessionId: string,
  ): Promise<SeatingSessionWithAssignment | null> {
    try {
      const sessionDetails = await this.db.query.seatingSessions.findFirst({
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
      this.logError("getSessionWithAssignments", error, { sessionId });
      throw error;
    }
  }
}

export const seatingSessionRepository = new SeatingSessionRepository();
