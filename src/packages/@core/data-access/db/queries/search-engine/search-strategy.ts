import { eq, and, like, inArray, sql, aliasedTable } from "drizzle-orm";

// Schemas are assumed to be properly imported from the unified schema declarations
import {
  feeAssignments,
  seatingAssignments,
  localrooms,
  seatingSessions,
  classroomEnrollments,
  users,
  classrooms,
  tutors,
} from "../../schemas";
import type {
  SearchContext,
  SearchStrategy,
  StudentSuggestion,
  BaseSuggestion,
  SearchEntityType,
  SearchSuggestion,
  StudentPreviewData,
  TutorPreviewData,
  TutorSuggestion,
} from "./types";
import {
  FrancoAfricanPhoneticEncoder,
  PhoneticSearchEngine,
  SearchableEntity,
} from "./phonetic-engine";
import { USER_ROLE_ENUM } from "../../options";
import { TDataBase } from "../../config";

type AnySQLiteDatabase = TDataBase;

interface PhoneticCachePayload {
  engine: PhoneticSearchEngine<SearchableEntity>;
  timestamp: number;
}

/** Handles hybrid database and phonetic searching for student entities. */
export class StudentSearchStrategy implements SearchStrategy {
  public readonly entityType = "STUDENT" as const;

  private static readonly ENGINE_TTL_MS = 1000 * 60 * 15;
  private static readonly MIN_PHONETIC_SCORE = 0.65;

  private readonly phoneticEngines = new Map<string, PhoneticCachePayload>();
  private readonly db: AnySQLiteDatabase;

  /**
   * Initializes the strategy with a generic Drizzle SQLite database interface.
   * @param db Drizzle database instance.
   */
  constructor(db: AnySQLiteDatabase) {
    this.db = db;
  }

  /**
   * Performs hybrid search and aggregate formatting.
   * @param query Search term.
   * @param ctx Search scope context.
   * @param limit Maximum results limit.
   * @returns List of aggregated student suggestions.
   */
  public async search(
    query: string,
    ctx: SearchContext,
    limit: number,
  ): Promise<StudentSuggestion[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const phoneticEngine = await this.getOrBuildPhoneticEngine(ctx);
    const phoneticResults = phoneticEngine.search(cleanQuery, {
      type: "student",
      minScore: StudentSearchStrategy.MIN_PHONETIC_SCORE,
    });
    const phoneticIds = phoneticResults.map((res) => res.item.id);

    const sqlWildcardQuery = `%${cleanQuery.toLowerCase()}%`;
    const codeMatches = await this.db
      .select({ userId: users.userId })
      .from(users)
      .innerJoin(
        classroomEnrollments,
        and(
          eq(classroomEnrollments.studentId, users.userId),
          eq(classroomEnrollments.yearId, ctx.yearId),
        ),
      )
      .where(
        and(
          eq(users.schoolId, ctx.schoolId),
          eq(users.role, USER_ROLE_ENUM.STUDENT),
          like(
            sql`LOWER(${classroomEnrollments.studentCode})`,
            sqlWildcardQuery,
          ),
        ),
      )
      .limit(limit);

    const codeIds = codeMatches.map((res) => res.userId);
    const candidateIds = [...new Set([...phoneticIds, ...codeIds])].slice(
      0,
      limit,
    );

    if (candidateIds.length === 0) return [];

    const aggregatedData = await this.fetchAggregatedContext(candidateIds, ctx);
    return this.buildStudentPreviews(candidateIds, aggregatedData);
  }

  private async getOrBuildPhoneticEngine(
    ctx: SearchContext,
  ): Promise<PhoneticSearchEngine<SearchableEntity>> {
    const cached = this.phoneticEngines.get(ctx.schoolId);
    if (
      cached &&
      Date.now() - cached.timestamp < StudentSearchStrategy.ENGINE_TTL_MS
    ) {
      return cached.engine;
    }

    const studentRecords = await this.db
      .select({
        id: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(
        and(
          eq(users.schoolId, ctx.schoolId),
          eq(users.role, USER_ROLE_ENUM.STUDENT),
        ),
      );

    const entities: SearchableEntity[] = studentRecords.map((s) => ({
      id: s.id,
      type: "student",
      firstName: s.firstName || "",
      lastName: s.lastName || "",
    }));

    const engine = new PhoneticSearchEngine<SearchableEntity>(
      new FrancoAfricanPhoneticEncoder(),
    );
    engine.index(entities);

    this.phoneticEngines.set(ctx.schoolId, {
      engine,
      timestamp: Date.now(),
    });

    return engine;
  }

  private async fetchAggregatedContext(
    studentIds: string[],
    ctx: SearchContext,
  ) {
    const baseConditions = and(
      inArray(classroomEnrollments.studentId, studentIds),
      eq(classroomEnrollments.yearId, ctx.yearId),
    );

    const studentUsers = aliasedTable(users, "studentUsers");
    const tutorUsers = aliasedTable(users, "tutorUsers");

    const [enrollmentsData, financialData, seatingData] = await Promise.all([
      this.db
        .select({
          studentId: classroomEnrollments.studentId,
          enrollmentId: classroomEnrollments.enrollmentId,
          studentCode: classroomEnrollments.studentCode,
          status: classroomEnrollments.status,
          classIdentifier: classrooms.identifier,
          tutorId: tutors.tutorId,
          tutorPhone: tutors.phoneNumber,
          tutorProfession: tutors.profession,
          tutorLastName: tutorUsers.lastName,
          tutorFirstName: tutorUsers.firstName,
          studentLastName: studentUsers.lastName,
          studentFirstName: studentUsers.firstName,
          studentMiddleName: studentUsers.middleName,
        })
        .from(classroomEnrollments)
        .innerJoin(
          studentUsers,
          eq(classroomEnrollments.studentId, studentUsers.userId),
        )
        .innerJoin(
          classrooms,
          eq(classroomEnrollments.classroomId, classrooms.classId),
        )
        .leftJoin(tutors, eq(classroomEnrollments.tutorId, tutors.tutorId))
        .leftJoin(tutorUsers, eq(tutors.userId, tutorUsers.userId))
        .where(baseConditions),

      this.db
        .select({
          studentId: classroomEnrollments.studentId,
          totalAssigned: sql<number>`COALESCE(SUM(${feeAssignments.totalAmount}), 0)`,
          totalPaid: sql<number>`COALESCE(SUM(${feeAssignments.amountPaid}), 0)`,
        })
        .from(classroomEnrollments)
        .innerJoin(
          feeAssignments,
          eq(feeAssignments.enrollmentId, classroomEnrollments.enrollmentId),
        )
        .where(baseConditions)
        .groupBy(classroomEnrollments.studentId),

      this.db
        .select({
          studentId: classroomEnrollments.studentId,
          roomName: localrooms.name,
          rowPosition: seatingAssignments.rowPosition,
          columnPosition: seatingAssignments.columnPosition,
          sessionName: seatingSessions.sessionName,
        })
        .from(seatingAssignments)
        .innerJoin(
          classroomEnrollments,
          eq(
            seatingAssignments.enrollmentId,
            classroomEnrollments.enrollmentId,
          ),
        )
        .innerJoin(
          localrooms,
          eq(seatingAssignments.localroomId, localrooms.localroomId),
        )
        .innerJoin(
          seatingSessions,
          eq(seatingAssignments.sessionId, seatingSessions.sessionId),
        )
        .where(baseConditions),
    ]);

    const tutorIds = enrollmentsData
      .map((e) => e.tutorId)
      .filter((id): id is string => Boolean(id));

    const siblingsData =
      tutorIds.length > 0
        ? await this.db
            .select({
              tutorId: classroomEnrollments.tutorId,
              studentId: users.userId,
              lastName: users.lastName,
              firstName: users.firstName,
              classIdentifier: classrooms.identifier,
            })
            .from(classroomEnrollments)
            .innerJoin(users, eq(classroomEnrollments.studentId, users.userId))
            .innerJoin(
              classrooms,
              eq(classroomEnrollments.classroomId, classrooms.classId),
            )
            .where(
              and(
                inArray(classroomEnrollments.tutorId, tutorIds),
                eq(classroomEnrollments.yearId, ctx.yearId),
              ),
            )
        : [];

    return { enrollmentsData, financialData, seatingData, siblingsData };
  }

  private buildStudentPreviews(
    candidateIds: string[],
    data: Awaited<ReturnType<typeof this.fetchAggregatedContext>>,
  ): StudentSuggestion[] {
    const enrollmentMap = new Map(
      data.enrollmentsData.map((e) => [e.studentId, e]),
    );
    const finMap = new Map(data.financialData.map((f) => [f.studentId, f]));
    const seatMap = new Map(data.seatingData.map((s) => [s.studentId, s]));

    return candidateIds.map((userId) => {
      const enr = enrollmentMap.get(userId);
      const fin = finMap.get(userId);
      const seat = seatMap.get(userId);

      const fullName = enr
        ? `${enr.studentLastName} ${enr.studentMiddleName || ""} ${enr.studentFirstName || ""}`.trim()
        : "Unknown Student";

      const totalAssigned = fin?.totalAssigned || 0;
      const totalPaid = fin?.totalPaid || 0;
      const balance = totalAssigned - totalPaid;

      let finStatus: StudentPreviewData["financials"]["status"] = "NO_FEES";
      if (totalAssigned > 0) {
        if (balance <= 0) finStatus = "PAID";
        else if (totalPaid > 0) finStatus = "PARTIAL";
        else finStatus = "UNPAID";
      }

      const siblings = enr?.tutorId
        ? data.siblingsData
            .filter((s) => s.tutorId === enr.tutorId && s.studentId !== userId)
            .map((s) => ({
              studentId: s.studentId,
              fullName: `${s.lastName} ${s.firstName || ""}`.trim(),
              classroomName: s.classIdentifier,
            }))
        : [];

      return {
        id: userId,
        type: "STUDENT",
        title: fullName,
        subtitle: enr
          ? `Code: ${enr.studentCode} • ${enr.classIdentifier}`
          : "Unregistered",
        preview: {
          studentCode: enr?.studentCode || "N/A",
          enrollment: enr
            ? {
                enrollmentId: enr.enrollmentId,
                classroomName: enr.classIdentifier,
                status: enr.status,
              }
            : null,
          tutor: enr?.tutorId
            ? {
                tutorId: enr.tutorId,
                fullName:
                  `${enr.tutorLastName} ${enr.tutorFirstName || ""}`.trim(),
                phone: enr.tutorPhone,
                profession: enr.tutorProfession,
              }
            : null,
          financials: { totalAssigned, totalPaid, balance, status: finStatus },
          seating: seat
            ? {
                roomName: seat.roomName,
                row: seat.rowPosition,
                column: seat.columnPosition,
                sessionName: seat.sessionName,
              }
            : null,
          siblings,
        },
      };
    });
  }
}
