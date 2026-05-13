import { sql, eq, and, count, exists, getTableColumns } from "drizzle-orm";
import { db } from "../../config";
import { BaseRepository } from "../base-repository.new";
import {
  seatingAssignments,
  seatingSessions,
  localRooms,
} from "../../schemas/schema";
import type {
  TSeatingSession,
  TSeatingSessionInsert,
  TSeatingSessionUpdate,
  FindManyOptions,
} from "../../schemas/types";

import { getLogger } from "@/packages/logger";

const logger = getLogger("Database-Repository");

const SESSION_SORT = {
  orderBy: [
    { column: sql`lower(${seatingSessions.sessionName})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof seatingSessions>;

export class SeatingSessionQuery extends BaseRepository<
  typeof seatingSessions,
  TSeatingSession & { hasAssignments: boolean },
  TSeatingSessionInsert,
  TSeatingSessionUpdate,
  typeof db
> {
  constructor() {
    super(
      db,
      logger,
      seatingSessions,
      seatingSessions.sessionId,
      "SeatingSession",
      SESSION_SORT,
    );
  }

  override getQuerySet() {
    return this.db
      .select({
        ...getTableColumns(this.table),
        hasAssignments: sql<boolean>`EXISTS (
          SELECT 1 FROM ${seatingAssignments} 
          WHERE ${seatingAssignments.sessionId} = ${seatingSessions.sessionId}
        )`.mapWith(Boolean),
      })
      .from(this.table)
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
      throw new Error("Impossible de récupérer l'état des salles.");
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
              enrolement: {
                with: {
                  student: true,
                },
              },
            },
          },
        },
      });

      if (!sessionDetails) return null;

      // Tri côté applicatif (Drizzle ne supporte pas encore le tri sur les relations imbriquées via 'with')
      if (sessionDetails.assignments) {
        sessionDetails.assignments.sort((a: any, b: any) => {
          const userA = a.enrolement?.user;
          const userB = b.enrolement?.user;

          const nameA = `${userA?.lastName ?? ""} ${userA?.firstName ?? ""}`
            .trim()
            .toLowerCase();
          const nameB = `${userB?.lastName ?? ""} ${userB?.firstName ?? ""}`
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
