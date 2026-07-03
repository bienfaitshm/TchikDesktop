import { eq, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  classrooms,
  options,
  classroomEnrollments,
  seatingAssignments,
  type TableClassroom,
  type TableClassroomEnrollment,
  type TableSeatingAssignment,
  type Classroom,
  type Option,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { BaseRepository, DatabaseError } from "@/packages/drizzle-queries";

import {
  applyQueryOptions,
  mergeQueryOptions,
  extractQueryPayload,
} from "@/packages/@core/data-access/db/queries/drizzle-builder";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import { createSQLiteSearchFilter } from "../drizzle-utility";

export type ClassroomDTO = Classroom & {
  option: Option | null;
};

export type BaseClassroomFilters = Partial<FindManyOptions<TableClassroom>>;

interface GetClassroomsOptions {
  classroomOptions?: BaseClassroomFilters;
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

  protected override getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        option: getTableColumns(options),
      })
      .from(this.table)
      .leftJoin(options, eq(classrooms.optionId, options.optionId))
      .$dynamic();
  }

  /**
   * Récupère les données de classes filtrées (compatible SQLite Case-Insensitive)
   */
  async fetchOptions(
    { filters, search }: SearchOptions<BaseClassroomFilters> = {},
    tx: TDataBase = this.db,
  ): Promise<ClassroomDTO[]> {
    try {
      let query = this.getQuerySet(tx);

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
        mergeQueryOptions(filters, CLASSROOM_DEFAULT_SORT),
      )) as ClassroomDTO[];
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Erreur lors de la récupération des options de classes.",
      );
      this.logError("fetchOptions", dbError, { filters, search });
      throw dbError;
    }
  }

  /**
   * Récupère les classes avec les étudiants associés via Drizzle Relational API (Compatible Transaction)
   */
  async findClassroomsWithStudents(
    {
      classroomOptions = {},
      enrollmentOptions = {},
    }: GetClassroomsOptions = {},
    tx: TDataBase = this.db,
  ) {
    try {
      const client = this.getClient(tx);

      return await client.query.classrooms.findMany({
        ...extractQueryPayload(
          this.table,
          mergeQueryOptions(classroomOptions, CLASSROOM_DEFAULT_SORT),
        ),
        with: {
          enrollments: {
            ...extractQueryPayload(classroomEnrollments, enrollmentOptions),
            with: { student: true },
          },
        },
      });
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Erreur lors de la récupération des classes et de leurs étudiants.",
      );
      this.logError("findClassroomsWithStudents", dbError, {
        classroomOptions,
      });
      throw dbError;
    }
  }

  /**
   * Récupère la structure complète : classes, étudiants et assignations de places (Compatible Transaction)
   */
  async findClassroomsWithStudentAndAssignments(
    {
      classroomOptions = {},
      enrollmentOptions = {},
      assignmentOptions = {},
    }: GetClassroomsOptions = {},
    tx: TDataBase = this.db,
  ) {
    try {
      const client = this.getClient(tx);

      return await client.query.classrooms.findMany({
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
      const dbError = DatabaseError.from(
        error,
        "Erreur lors de la récupération complète des assignations.",
      );
      this.logError("findClassroomsWithStudentAndAssignments", dbError, {
        classroomOptions,
      });
      throw dbError;
    }
  }
}
