import { sql, eq, and, count, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "../../config";
import { getLogger } from "@/packages/logger";
import { BaseRepository } from "../base-repository";
import {
  seatingAssignments,
  seatingSessions,
  localRooms,
} from "../../schemas/schema";
import type { FindManyOptions } from "../../schemas/types";

import {
  TClassroom,
  TEnrolement,
  TUser as TStudent,
  TLocalRoom,
  TSeatingSession,
} from "@/packages/@core/data-access/db/schemas/types";

export type TEnrolementWithRelations = TEnrolement & {
  student: TStudent;
  classRoom: TClassroom;
};

// Définition propre de l'Assignment
export type TAssignment = {
  assignmentId: string;
  sessionId: string;
  localRoomId: string;
  enrolementId: string;
  rowPosition: number;
  columnPosition: number;
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

const SESSION_SORT = {
  orderBy: [
    { column: sql`lower(${seatingSessions.sessionName})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof seatingSessions>;

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
          localRoomId: localRooms.localRoomId,
          roomName: localRooms.name,
          maxCapacity: localRooms.maxCapacity,
          assignedCount: count(seatingAssignments.assignmentId),
          occupancyRate: sql<number>`CAST(COUNT(${seatingAssignments.assignmentId}) AS FLOAT) / ${localRooms.maxCapacity} * 100`,
        })
        .from(localRooms)
        .innerJoin(
          seatingAssignments,
          and(
            eq(seatingAssignments.localRoomId, localRooms.localRoomId),
            eq(seatingAssignments.sessionId, sessionId),
          ),
        )
        .groupBy(
          localRooms.localRoomId,
          localRooms.name,
          localRooms.maxCapacity,
        )
        .orderBy(localRooms.name);
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
  async getSessionWithAssignments(
    sessionId: string,
  ): Promise<TSeatingSessionWithAssignment | null> {
    try {
      const sessionDetails = await this.db.query.seatingSessions.findFirst({
        where: eq(seatingSessions.sessionId, sessionId),
        with: {
          assignments: {
            with: {
              localRoom: true,
              enrolement: {
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

      // Tri côté applicatif (Drizzle ne supporte pas encore le tri sur les relations imbriquées via 'with')
      if (sessionDetails.assignments) {
        sessionDetails.assignments.sort((a, b) => {
          const userA = a.enrolement?.student;
          const userB = b.enrolement?.student;

          const nameA =
            `${userA?.lastName ?? ""} ${userA?.middleName ?? ""} ${userA?.firstName ?? ""}`
              .trim()
              .toLowerCase();
          const nameB =
            `${userB?.lastName ?? ""} ${userB?.middleName ?? ""} ${userB?.firstName ?? ""}`
              .trim()
              .toLowerCase();

          return nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
        });
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
      const { localRoomId, localRoom } = assignment;

      if (!acc[localRoomId]) {
        acc[localRoomId] = {
          ...localRoom,
          students: [],
        };
      }

      acc[localRoomId].students.push(assignment);
      return acc;
    },
    {} as Record<string, TLocalRoom & { students: TAssignment[] }>,
  );

  return {
    ...sessionData,
    assignments: Object.values(grouped),
  };
}
