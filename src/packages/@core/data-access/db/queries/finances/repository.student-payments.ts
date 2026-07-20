import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeConfigurations,
  feeAssignments,
  studentPayments,
  type TableStudentPayment,
  options,
  feeTypes,
  classrooms,
  type FeeType,
  type Classroom,
  classroomEnrollments,
  users,
  StudentPayment,
  User,
} from "@/packages/@core/data-access/db/schemas";
import { helpers, betterSqlite } from "@/packages/drizzle-queries";
import { eq, getTableColumns } from "drizzle-orm";
import { UserRepository } from "../users";

const TABLES = {
  classrooms,
  options,
  studentPayments,
  feeAssignments,
  classroomEnrollments,
  feeConfigurations,
  feeTypes,
  users,
} as const;

export type BaseStudentPaymentFilters = helpers.FindManyOptions<typeof TABLES>;

export type StudentPaymentDTO = StudentPayment & {
  feeType: FeeType;
  classroom: Classroom;
  student: User;
};

const DEFAULT_SORT: BaseStudentPaymentFilters = {
  orderBy: [{ table: "studentPayments", column: "paymentId", order: "desc" }],
};

export class StudentPaymentRepository extends betterSqlite.BaseRepository<
  TableStudentPayment,
  TDataBase
> {
  /**
   * Initializes a new instance of the StudentPaymentRepository.
   * @param database - Optional database connection instance.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: studentPayments,
      idColumn: studentPayments.paymentId,
      baseTableName: "StudentPayment",
      logger: getLogger,
      defaultFilters: DEFAULT_SORT,
      joinTables: TABLES,
    });
  }

  /**
   * Constructs the base query set with all necessary inner joins for student payments.
   * @param tx - Optional database transaction instance.
   * @returns The dynamic query builder populated with joined relations.
   */
  protected getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        classroom: getTableColumns(classrooms),
        student: UserRepository.getVisibleColumns(),
        feeType: getTableColumns(feeTypes),
      })
      .from(this.table)
      .innerJoin(
        feeAssignments,
        eq(this.table.assignmentId, feeAssignments.assignmentId),
      )
      .innerJoin(
        classroomEnrollments,
        eq(feeAssignments.enrollmentId, classroomEnrollments.enrollmentId),
      )
      .innerJoin(
        classrooms,
        eq(classroomEnrollments.classroomId, classrooms.classId),
      )
      .innerJoin(users, eq(classroomEnrollments.studentId, users.userId))
      .innerJoin(
        feeConfigurations,
        eq(feeAssignments.feeConfigId, feeConfigurations.feeConfigId),
      )
      .innerJoin(feeTypes, eq(feeConfigurations.feeTypeId, feeTypes.feeTypeId))
      .$dynamic();
  }
}

export const studentPaymentRepository = new StudentPaymentRepository(db);
