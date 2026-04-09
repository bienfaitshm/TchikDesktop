import { eq, sql, getTableColumns } from "drizzle-orm";
import { db } from "../config";
import {
  classRooms,
  options,
  studyYears,
  classroomEnrolements,
  users,
} from "../schemas/schema";
import { BaseRepository } from "./base-repository";
import { applyQueryOptions } from "./drizzle-builder";
import type {
  TClassroom,
  TClassroomInsert,
  TClassroomUpdate,
  FindManyOptions,
} from "../schemas/types";

/**
 * DTO enrichi pour le Frontend
 */
export type TClassroomDTO = TClassroom & {
  optionName: string | null;
  optionShortName: string | null;
  yearName: string;
  startDate: Date;
  endDate: Date;
};

const CLASSROOM_DEFAULT_SORT = {
  orderBy: [
    { column: sql`lower(${classRooms.identifier})`, order: "asc" },

    { column: sql`lower(${classRooms.shortIdentifier})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof classRooms>;

export class ClassroomQuery extends BaseRepository<
  typeof classRooms,
  TClassroom,
  TClassroomInsert,
  TClassroomUpdate
> {
  // Définition statique des colonnes pour éviter les problèmes de contexte
  private readonly selection = {
    ...getTableColumns(classRooms),
    optionName: options.optionName,
    optionShortName: options.optionShortName,
    yearName: studyYears.yearName,
    startDate: studyYears.startDate,
    endDate: studyYears.endDate,
  };

  constructor() {
    super(classRooms, classRooms.classId, "Classroom", CLASSROOM_DEFAULT_SORT);
  }

  /**
   * Version étendue avec Jointures SQL (Performance brute)
   */
  async findManyExtended(
    filters?: FindManyOptions<typeof classRooms>,
  ): Promise<TClassroomDTO[]> {
    try {
      const query = db
        .select(this.selection)
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .$dynamic();

      return (await applyQueryOptions(
        query,
        classRooms,
        filters as any,
      )) as TClassroomDTO[];
    } catch (error) {
      this.logError("findManyExtended", error, { filters });
      throw new Error("Erreur lors de la récupération des classes enrichies.");
    }
  }

  /**
   * Recherche par ID avec relations à plat
   */
  override async findById(classId: string): Promise<TClassroomDTO | null> {
    if (!classId) return null;
    try {
      const [result] = await db
        .select(this.selection)
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .where(eq(classRooms.classId, classId))
        .limit(1);

      return (result as TClassroomDTO) || null;
    } catch (error) {
      this.logError("findById", error, { classId });
      throw new Error("Impossible de trouver la classe spécifiée.");
    }
  }

  /**
   * API Relationnelle (Nested objects)
   * Idéal pour les vues de détails complexes avec listes d'élèves.
   */
  async findWithEnrollments(
    filters?: FindManyOptions<typeof classRooms>,
  ): Promise<any[]> {
    try {
      const query = db
        .select({
          classRoom: classRooms,
          option: options,
          studyYear: studyYears,
          enrolement: classroomEnrolements,
          user: {
            userId: users.userId,
            firstName: users.firstName,
            lastName: users.lastName,
            middleName: users.middleName,
            gender: users.gender,
          },
        })
        .from(classRooms)
        // Utilisation de leftJoin pour ne pas perdre les classes sans élèves/options
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .leftJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .leftJoin(
          classroomEnrolements,
          eq(classRooms.classId, classroomEnrolements.classroomId),
        )
        .leftJoin(users, eq(classroomEnrolements.studentId, users.userId))
        .$dynamic();

      return (await applyQueryOptions(
        query,
        classRooms,
        filters as any,
      )) as TClassroomDTO[];
    } catch (error) {
      this.logError("findWithEnrollments", error, { ...filters });
      throw new Error("Erreur lors de la récupération des inscriptions.");
    }
  }

  static instance = new ClassroomQuery();
}

export const classroomService = ClassroomQuery.instance;
