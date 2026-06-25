import { eq, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  classrooms,
  options,
  studyYears,
  classroomEnrollments,
  seatingAssignments,
  type TableClassroom,
  type TableClassroomEnrollment,
  type TableSeatingAssignment,
  type Classroom,
  type Option,
  type StudyYear,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import {
  BaseRepository,
  LibSqlClient,
} from "@/packages/@core/data-access/db/queries/base-repository";
import {
  applyQueryOptions,
  extractQueryPayload,
} from "@/packages/@core/data-access/db/queries/drizzle-builder";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import { createSQLiteSearchFilter } from "../drizzle-utility";

export type ClassroomDTO = Classroom & {
  studyYear: StudyYear;
  option: Option | null;
};

export type BaseClasrromFilters = Partial<FindManyOptions<TableClassroom>>;
interface GetClassroomsOptions {
  classroomOptions?: BaseClasrromFilters;
  enrollmentOptions?: Partial<FindManyOptions<TableClassroomEnrollment>>;
  assignmentOptions?: Partial<FindManyOptions<TableSeatingAssignment>>;
}

const CLASSROOM_DEFAULT_SORT: FindManyOptions<TableClassroom> = {
  orderBy: [
    { column: "identifier", order: "asc" },
    { column: "shortIdentifier", order: "asc" },
  ],
};

export class ClassroomRepository
  extends BaseRepository<TableClassroom, TDataBase, ClassroomDTO>
  implements OptionProvider<ClassroomDTO>
{
  constructor() {
    super({
      db,
      table: classrooms,
      idColumn: classrooms.classId,
      entityName: "Classroom",
      logger: getLogger,
      defaultSort: CLASSROOM_DEFAULT_SORT,
    });
  }

  protected override getQuerySet(tx?: LibSqlClient) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        studyYear: getTableColumns(studyYears),
        option: getTableColumns(options),
      })
      .from(this.table)
      .innerJoin(studyYears, eq(classrooms.yearId, studyYears.yearId))
      .leftJoin(options, eq(classrooms.optionId, options.optionId))
      .$dynamic();
  }

  /**
   * Récupère les données de classes filtrées (compatible SQLite Case-Insensitive)
   * ou les données par défaut si aucune recherche n'est fournie.
   */
  async fetchOptions({
    filters,
    search,
  }: SearchOptions<BaseClasrromFilters> = {}): Promise<ClassroomDTO[]> {
    try {
      let query = this.getQuerySet();

      const searchFilter = createSQLiteSearchFilter(
        [classrooms.identifier, classrooms.shortIdentifier],
        search,
      );

      if (searchFilter) {
        query = query.where(searchFilter).limit(20);
      }

      return (await applyQueryOptions(
        query,
        this.table,
        filters,
      )) as ClassroomDTO[];
    } catch (error) {
      this.logError("fetchOptions", error, { filters, search });
      throw new Error("Erreur lors de la récupération des options de classes.");
    }
  }

  /**
   * Récupère les classes avec les étudiants associés via Drizzle Relational API
   */
  async findClassroomsWithStudents({
    classroomOptions = {},
    enrollmentOptions = {},
  }: GetClassroomsOptions = {}) {
    try {
      return await this.db.query.classrooms.findMany({
        ...extractQueryPayload(this.table, classroomOptions),
        with: {
          enrollments: {
            ...extractQueryPayload(classroomEnrollments, enrollmentOptions),
            with: { student: true },
          },
        },
      });
    } catch (error) {
      this.logError("findClassroomsWithStudents", error, { classroomOptions });
      throw new Error(
        "Erreur lors de la récupération des classes et de leurs étudiants.",
      );
    }
  }

  /**
   * Récupère les classes, étudiants et assignations de places
   */
  async findClassroomsWithStudentAndAssignments({
    classroomOptions = {},
    enrollmentOptions = {},
    assignmentOptions = {},
  }: GetClassroomsOptions = {}) {
    try {
      return await this.db.query.classrooms.findMany({
        ...extractQueryPayload(this.table, classroomOptions),
        with: {
          enrollments: {
            ...extractQueryPayload(classroomEnrollments, enrollmentOptions),
            with: {
              student: true,
              seatingAssignments: {
                ...extractQueryPayload(seatingAssignments, assignmentOptions),
                with: { localroom: true },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logError("findClassroomsWithStudentAndAssignments", error, {
        classroomOptions,
      });
      throw new Error(
        "Erreur lors de la récupération complète des assignations.",
      );
    }
  }
}
