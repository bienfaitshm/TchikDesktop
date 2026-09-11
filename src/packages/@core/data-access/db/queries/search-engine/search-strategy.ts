import { eq, and, or, like, sql } from "drizzle-orm";
import { classroomEnrollments, users, type User } from "../../schemas";
import type { SearchContext, SearchStrategy, StudentSuggestion } from "./types";
import {
  FrancoAfricanPhoneticEncoder,
  PhoneticSearchEngine,
  SearchableEntity,
} from "./phonetic-engine";
import { USER_ROLE_ENUM } from "../../options";
import { db, TDataBase } from "../../config";
import { formatFullName } from "./utils";
import { Preview, StudentPreviewRepository } from "./preview-repository";

type AnySQLiteDatabase = TDataBase;

type UserEntityName = { id: string } & Pick<
  User,
  "userId" | "lastName" | "middleName" | "firstName"
>;

interface PhoneticCachePayload {
  engine: PhoneticSearchEngine<SearchableEntity>;
  timestamp: number;
}

export interface StudentAggregatedRawData {
  enrollmentsData: Array<{
    studentId: string;
    enrollmentId: string;
    studentCode: string;
    status: string;
    classIdentifier: string;
    tutorId: string | null;
    tutorPhone: string | null;
    tutorProfession: string | null;
    tutorLastName: string | null;
    tutorFirstName: string | null;
    studentLastName: string;
    studentFirstName: string | null;
    studentMiddleName: string | null;
  }>;
  financialData: Array<{
    studentId: string;
    totalAssigned: number;
    totalPaid: number;
  }>;
  seatingData: Array<{
    studentId: string;
    roomName: string;
    rowPosition: number;
    columnPosition: number;
    sessionName: string;
  }>;
  siblingsData: Array<{
    tutorId: string | null;
    studentId: string;
    lastName: string;
    middleName: string;
    firstName: string | null;
    classIdentifier: string;
  }>;
}

/**
 * Handles caching and indexing of phonetic search engines per school.
 */
export class StudentPhoneticCache {
  private static readonly ENGINE_TTL_MS = 1000 * 60 * 15;
  private readonly phoneticEngines = new Map<string, PhoneticCachePayload>();

  /**
   * Retrieves an existing valid cache engine or builds a new one.
   * @param db Database connection instance.
   * @param ctx Current search context.
   * @returns The active phonetic search engine for the context school.
   */
  public async getOrBuild(
    db: AnySQLiteDatabase,
    ctx: SearchContext,
  ): Promise<PhoneticSearchEngine<SearchableEntity>> {
    const cached = this.phoneticEngines.get(ctx.schoolId);
    if (
      cached &&
      Date.now() - cached.timestamp < StudentPhoneticCache.ENGINE_TTL_MS
    ) {
      return cached.engine;
    }

    const studentRecords = await db
      .select({
        id: users.userId,
        firstName: users.firstName,
        middleName: users.middleName,
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
      middleName: s.middleName || "",
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
}

/**
 * Executes relational database operations for student search queries.
 */
export class StudentSearchRepository {
  /**
   * Finds student IDs matching a text pattern in code, last name, or first name.
   * @param db Database connection instance.
   * @param cleanQuery Clean search query string.
   * @param ctx Search context.
   * @param limit Maximum record threshold.
   * @returns Array of matched student user IDs.
   */
  public async findByText(
    db: AnySQLiteDatabase,
    cleanQuery: string,
    ctx: SearchContext,
    limit: number,
  ): Promise<UserEntityName[]> {
    const sqlWildcardQuery = `%${cleanQuery.toLowerCase()}%`;
    return await db
      .select({
        userId: users.userId,
        id: users.userId,
        firstName: users.firstName,
        middleName: users.middleName,
        lastName: users.lastName,
      })
      .from(users)
      .innerJoin(
        classroomEnrollments,
        and(eq(classroomEnrollments.studentId, users.userId)),
      )
      .where(
        and(
          eq(users.schoolId, ctx.schoolId),
          eq(users.role, USER_ROLE_ENUM.STUDENT),
          or(
            like(
              sql`LOWER(${classroomEnrollments.studentCode})`,
              sqlWildcardQuery,
            ),
            like(sql`LOWER(${users.lastName})`, sqlWildcardQuery),
            like(sql`LOWER(${users.middleName})`, sqlWildcardQuery),
            like(sql`LOWER(${users.firstName})`, sqlWildcardQuery),
          ),
        ),
      )
      .limit(limit);
  }
}

/**
 * Transforms raw database query results into UI preview DTOs.
 */
export class StudentPreviewMapper {
  /**
   * Maps candidate student records and raw relational data into formatted suggestions.
   * @param students List of student.
   * @param data Raw aggregated database datasets.
   * @returns Array of UI ready student suggestions preserving the input order.
   */
  public static mapToPreviews(
    students: UserEntityName[],
    data: Map<string, Preview>,
  ): StudentSuggestion[] {
    return students.map((student) => {
      const preview = data.get(student.userId);

      const fullName = formatFullName(
        student.lastName,
        student.middleName,
        student.firstName,
      );

      return {
        id: student.userId,
        type: "STUDENT",
        title: fullName.toUpperCase(),
        subtitle: preview?.subTitle ?? "",
        preview,
      } as StudentSuggestion;
    });
  }
}

/**
 * Coordinates hybrid search strategy for student entities using modular components.
 */
export class StudentSearchStrategy implements SearchStrategy {
  public readonly entityType = "STUDENT" as const;

  private static readonly MIN_PHONETIC_SCORE = 0.65;
  private static readonly SQL_EXACT_MATCH_SCORE = 2.0;

  private readonly db: AnySQLiteDatabase;
  private readonly phoneticCache: StudentPhoneticCache;
  private readonly repository: StudentSearchRepository;

  /**
   * Initializes the student search strategy.
   * @param db Database instance.
   * @param phoneticCache Service handling phonetic engine lifecycle.
   * @param repository Data repository for student database queries.
   */
  constructor(
    db: AnySQLiteDatabase,
    phoneticCache = new StudentPhoneticCache(),
    repository = new StudentSearchRepository(),
  ) {
    this.db = db;
    this.phoneticCache = phoneticCache;
    this.repository = repository;
  }

  /**
   * Performs a scored hybrid search for student entities and maps previews.
   * @param query Raw user search input.
   * @param ctx Scope and filtering parameters.
   * @param limit Result limit.
   * @returns Aggregated, sorted list of student suggestion DTOs.
   */
  public async search(
    query: string,
    ctx: SearchContext,
    limit: number,
  ): Promise<StudentSuggestion[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const phoneticEngine = await this.phoneticCache.getOrBuild(this.db, ctx);
    const phoneticResults = phoneticEngine.search(cleanQuery, {
      type: "student",
      minScore: StudentSearchStrategy.MIN_PHONETIC_SCORE,
    });

    const students = await this.repository.findByText(
      this.db,
      cleanQuery,
      ctx,
      limit,
    );

    const relevanceScores = new Map<
      string,
      { score: number; student: UserEntityName }
    >(
      students.map((student) => [
        student.userId,
        { score: StudentSearchStrategy.SQL_EXACT_MATCH_SCORE, student },
      ]),
    );

    // Merge phonetic scores, keeping the highest score if duplicate
    for (const res of phoneticResults) {
      const existingScore = relevanceScores.get(res.item.id)?.score || 0;
      if (res.score > existingScore) {
        relevanceScores.set(res.item.id, {
          score: res.score,
          student: { ...res.item, userId: res.item.id },
        });
      }
    }

    // Sort descending by relevance score
    const candidateIds = Array.from(relevanceScores.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .map((entry) => entry[1].student)
      .slice(0, limit);

    if (candidateIds.length === 0) return [];

    const previewMapper = new StudentPreviewRepository(db, ctx);
    const aggregatedData = await previewMapper.mapPreview(
      candidateIds.map((st) => st.userId),
    );

    return StudentPreviewMapper.mapToPreviews(candidateIds, aggregatedData);
  }
}
