import { sql, eq, and, count, isNull } from "drizzle-orm";
import { db } from "../config";
import { BaseRepository } from "./base-repository";
import {
  seatingAssignments,
  classroomEnrolements,
  users,
  seatingSessions,
  localRooms,
} from "../schemas/schema";
import type {
  TLocalRoom,
  TLocalRoomInsert,
  TLocalRoomUpdate,
  TSeatingSession,
  TSeatingSessionInsert,
  TSeatingSessionUpdate,
  TSeatingAssignment,
  TSeatingAssignmentInsert,
  TSeatingAssignmentUpdate,
  FindManyOptions,
} from "../schemas/types";

// ============================================================================
// 1. LOCAL ROOM QUERY
// ============================================================================

const LOCAL_ROOM_SORT = {
  orderBy: [{ column: sql`lower(${localRooms.name})`, order: "asc" }],
} as unknown as FindManyOptions<typeof localRooms>;

export class LocalRoomQuery extends BaseRepository<
  typeof localRooms,
  TLocalRoom,
  TLocalRoomInsert,
  TLocalRoomUpdate
> {
  constructor() {
    super(localRooms, localRooms.localRoomId, "LocalRoom", LOCAL_ROOM_SORT);
  }
  static instance = new LocalRoomQuery();
}
export const localRoomService = LocalRoomQuery.instance;

// ============================================================================
// 2. SEATING SESSION QUERY
// ============================================================================

const SESSION_SORT = {
  orderBy: [
    { column: sql`lower(${seatingSessions.sessionName})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof seatingSessions>;

export class SeatingSessionQuery extends BaseRepository<
  typeof seatingSessions,
  TSeatingSession,
  TSeatingSessionInsert,
  TSeatingSessionUpdate
> {
  constructor() {
    super(
      seatingSessions,
      seatingSessions.sessionId,
      "SeatingSession",
      SESSION_SORT,
    );
  }

  async findByYear(schoolId: string, yearId: string) {
    return db
      .select()
      .from(seatingSessions)
      .where(
        and(
          eq(seatingSessions.schoolId, schoolId),
          eq(seatingSessions.yearId, yearId),
        ),
      );
  }

  async getSessionRoomsStatus(sessionId: string) {
    if (!sessionId) return [];
    try {
      return await db
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

  async getFullSessionDetails(sessionId: string) {
    try {
      const sessionDetails = await db.query.seatingSessions.findFirst({
        where: eq(seatingSessions.sessionId, sessionId),
        with: {
          assignments: {
            with: {
              localRoom: true,
              enrolement: {
                with: { user: true },
              },
            },
          },
        },
      });

      // Optimisation Senior : Drizzle ORM ne permet pas de trier facilement (via `orderBy` dans `with`)
      // sur une table imbriquée à 2 niveaux de profondeur (user.lastName).
      // On effectue donc un tri en mémoire ultra-rapide côté serveur.
      if (sessionDetails?.assignments) {
        sessionDetails.assignments.sort((a: any, b: any) => {
          const nameA =
            `${a.enrolement?.user?.lastName} ${a.enrolement?.user?.firstName}`.toLowerCase();
          const nameB =
            `${b.enrolement?.user?.lastName} ${b.enrolement?.user?.firstName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      }

      return sessionDetails;
    } catch (error) {
      this.logError("getFullSessionDetails", error, { sessionId });
      throw error;
    }
  }
  static instance = new SeatingSessionQuery();
}
export const seatingSessionService = SeatingSessionQuery.instance;

// ============================================================================
// 3. SEATING ASSIGNMENT QUERY
// ============================================================================

export class SeatingAssignmentQuery extends BaseRepository<
  typeof seatingAssignments,
  TSeatingAssignment,
  TSeatingAssignmentInsert,
  TSeatingAssignmentUpdate
> {
  constructor() {
    super(
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
          isNull(seatingAssignments.assignmentId), // Uniquement ceux sans assignation
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
