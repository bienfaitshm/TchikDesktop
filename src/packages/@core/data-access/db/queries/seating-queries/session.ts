import { sql, eq, and, count, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "../../config";
import { getLogger } from "@/packages/logger";
import { BaseRepository } from "../base-repository";
import {
  seatingAssignments,
  seatingSessions,
  localrooms,
} from "../../schemas/schema";
import type { FindManyOptions } from "../../schemas/types";

import type {
  TClassroom,
  TEnrolement,
  TUser as TStudent,
  TLocalRoom,
  TSeatingSession,
  TSeatingAssignment,
} from "@/packages/@core/data-access/db/schemas/types";
import { compareByFullName, withFullName } from "../query-utils";

export type TEnrolementWithRelations = TEnrolement & {
  student: TStudent;
  classRoom: TClassroom;
};

export type TAssignment = TSeatingAssignment & {
  localRoom: TLocalRoom;
  enrolement: TEnrolementWithRelations;
};

export type TSeatingSessionWithAssignment = TSeatingSession & {
  assignments: TAssignment[];
};

export type TSeatingSessionGrouped = TSeatingSession & {
  assignments: (TLocalRoom & {
    students: TAssignment[];
  })[];
};

const SESSION_SORT: FindManyOptions<typeof seatingSessions> = {
  orderBy: [{ column: "sessionName", order: "asc" }],
};
export class SeatingSessionQuery extends BaseRepository<
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

  override getQuerySet() {
    return this.db
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
          occupancyRate: sql<number>`CAST(COUNT(${seatingAssignments.assignmentId}) AS FLOAT) / ${localrooms.maxCapacity} * 100`,
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

  /**
   * Récupère une session avec ses affectations, localisations et utilisateurs inscrits,
   * triés par nom de famille puis prénom.
   */
  async getSessionWithAssignments(sessionId: string) {
    try {
      const sessionDetails = await this.db.query.seatingSessions.findFirst({
        where: eq(seatingSessions.sessionId, sessionId),
        with: {
          assignments: {
            with: {
              localRoom: true,
              enrollment: {
                with: {
                  student: true,
                  classRoom: true,
                },
              },
            },
          },
        },
      });

      if (!sessionDetails) return null;

      if (sessionDetails.assignments) {
        sessionDetails.assignments.sort(
          compareByFullName((assignment) => assignment.enrollment.student),
        );
      }
      return sessionDetails;
    } catch (error) {
      console.log("error", error);
      this.logError("getSessionWithAssignments", error, { sessionId });
      throw error;
    }
  }

  static instance = new SeatingSessionQuery();
}
export const seatingSessionService = SeatingSessionQuery.instance;

/**
 * Groupe les affectations par localRoom.
 * @param assignments - Liste des affectations issues de la session
 */
export function groupByLocalRoom(
  sessionData: TSeatingSessionWithAssignment,
): TSeatingSessionGrouped {
  const grouped = sessionData.assignments.reduce(
    (acc, assignment) => {
      const { localroomId, localRoom, enrolement } = assignment;

      if (!acc[localroomId]) {
        acc[localroomId] = {
          ...localRoom,
          students: [],
        };
      }
      const student: TAssignment = {
        ...assignment,
        enrolement: {
          ...enrolement,
          student: withFullName(enrolement.student),
        },
      };
      acc[localroomId].students.push(student);
      return acc;
    },
    {} as Record<string, TLocalRoom & { students: TAssignment[] }>,
  );

  return {
    ...sessionData,
    assignments: Object.values(grouped),
  };
}
