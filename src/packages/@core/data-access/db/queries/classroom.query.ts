import { eq, sql, asc } from "drizzle-orm";
import { db } from "../config";
import { classRooms, options, studyYears } from "../schemas/schema";
import { BaseRepository } from "./base-repository";
import { applyQueryOptions } from "./drizzle-builder";
import type {
  TClassroom,
  TClassroomInsert,
  TClassroomUpdate,
  FindManyOptions,
} from "../schemas/types";

/**
 * Configuration des tris par défaut (Encapsulé pour la réutilisation)
 */
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
  constructor() {
    super(classRooms, classRooms.classId, "Classroom", CLASSROOM_DEFAULT_SORT);
  }

  /**
   * Overriding findMany: Utilisation de Joins SQL pour la performance et les colonnes spécifiques.
   * On garde la compatibilité avec applyQueryOptions.
   */
  async findManyExtended(filters?: any): Promise<any[]> {
    try {
      const query = db
        .select({
          classId: classRooms.classId,
          identifier: classRooms.identifier,
          shortIdentifier: classRooms.shortIdentifier,
          section: classRooms.section,
          schoolId: classRooms.schoolId,
          optionName: options.optionName,
          optionShortName: options.optionShortName,
          yearName: studyYears.yearName,
          startDate: studyYears.startDate,
        })
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .$dynamic();

      // Note: On passe null pour defaultSort ici car les tris sont déjà gérés
      // ou injectés via filters pour éviter les conflits SQL
      return await applyQueryOptions(query, classRooms, filters);
    } catch (error) {
      this.logError("findManyExtended", error, { filters });
      throw new Error("Impossible de récupérer la liste enrichie des classes.");
    }
  }

  /**
   * Récupère une classe spécifique avec ses relations via Joins SQL.
   */
  override async findById(classId: string): Promise<any | null> {
    if (!classId) return null;
    try {
      const [result] = await db
        .select()
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .where(eq(classRooms.classId, classId));

      return result || null;
    } catch (error) {
      this.logError("findById", error, { classId });
      throw new Error("Détails de la classe introuvables.");
    }
  }

  /**
   * Utilisation de l'API Relational de Drizzle pour les structures imbriquées complexes (Inscriptions).
   * Plus lisible pour le frontend que des jointures plates.
   */
  async findWithEnrollments(schoolId?: string): Promise<any[]> {
    try {
      return await db.query.classRooms.findMany({
        where: schoolId ? eq(classRooms.schoolId, schoolId) : undefined,
        with: {
          option: true,
          studyYear: true,
          enrolements: {
            with: {
              user: {
                columns: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  gender: true,
                },
              },
            },
          },
        },
        // On réutilise sql`lower(...)` pour la cohérence
        orderBy: [
          asc(sql`lower(${classRooms.identifier})`),
          asc(sql`lower(${classRooms.shortIdentifier})`),
        ],
      });
    } catch (error) {
      this.logError("findWithEnrollments", error, { schoolId });
      throw new Error("Échec de la récupération des inscriptions.");
    }
  }

  static instance = new ClassroomQuery();
}

export const classroomService = ClassroomQuery.instance;
