import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { StatsRoutes } from "../../routes-constant";
import { StatsService } from "@/packages/@core/data-access/db/queries";
import {
  schoolIdBaseSchema,
  type SchoolYearIdBase,
  schoolYearIdBaseSchema,
  type SchoolIdBase,
} from "@/packages/@core/data-access/schema-validations";

/**
 * Handles Inter-Process Communication (IPC) inbound requests for institutional statistics and KPIs.
 */
export class StatsController {
  /**
   * Retrieves high-level institutional KPIs for dashboard summaries.
   * @param req - The IPC request context carrying standard operational statistics filters.
   * @returns A promise resolving to the global metrics summary object.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.SUMMARY, {
    params: schoolYearIdBaseSchema,
  })
  static async getSummary({
    params: { schoolId, yearId },
  }: IpcRequest<unknown, SchoolYearIdBase>) {
    return StatsService.getQuickKpis(schoolId, yearId);
  }

  /**
   * Retrieves student distribution metrics grouped by registration status.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to status distribution data arrays.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_STATUS, {
    params: schoolYearIdBaseSchema,
  })
  static async getByStatus({
    params: { schoolId, yearId },
  }: IpcRequest<unknown, SchoolYearIdBase>) {
    return StatsService.getStudentStatusStats(schoolId, yearId);
  }

  /**
   * Extracts absolute school-wide student distributions categorized by gender.
   * @param req - The IPC request context holding primary school identification parameters.
   * @returns A promise resolving to global institutional gender statistics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_GENDER, {
    params: schoolIdBaseSchema,
  })
  static async getByGender({
    params: { schoolId },
  }: IpcRequest<unknown, SchoolIdBase>) {
    return StatsService.getGenderDistribution(schoolId);
  }

  /**
   * Compiles enrollment headcount records structured per distinct classroom space.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to classroom occupancy volume metrics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_CLASS, {
    params: schoolYearIdBaseSchema,
  })
  static async getByClass({
    params: { schoolId, yearId },
  }: IpcRequest<unknown, SchoolYearIdBase>) {
    return StatsService.getStudentsCountByClass(schoolId, yearId);
  }

  /**
   * Fetches total student enrollment numbers grouped by selected study options.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to specialized study option volume metrics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_OPTION, {
    params: schoolYearIdBaseSchema,
  })
  static async getByOption({
    params: { schoolId, yearId },
  }: IpcRequest<unknown, SchoolYearIdBase>) {
    return StatsService.getStudentsCountByOption(schoolId, yearId);
  }

  /**
   * Processes student body retention indexes contrasting current and historical cycles.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to structural school retention statistics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.RETENTION, {
    params: schoolYearIdBaseSchema,
  })
  static async getRetention({
    params: { schoolId, yearId },
  }: IpcRequest<unknown, SchoolYearIdBase>) {
    return StatsService.getRetentionMetrics(schoolId, yearId);
  }

  /**
   * Returns a baseline total aggregate count of all students inside a specific boundary.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to the absolute numeric volume of students.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.TOTAL_STUDENTS, {
    params: schoolYearIdBaseSchema,
  })
  static async getTotalStudents({
    params: { schoolId, yearId },
  }: IpcRequest<unknown, SchoolYearIdBase>) {
    return StatsService.getTotalStudents(schoolId, yearId);
  }

  /**
   * Tracks long-term chronological student registration trends mapped over multiple years.
   * @param req - The IPC request context holding primary school identification parameters.
   * @returns A promise resolving to historical multi-year enrollment growth datasets.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.ENROLLMENTS_BY_YEAR, {
    params: schoolIdBaseSchema,
  })
  static async getEnrollmentsByYear({
    params: { schoolId },
  }: IpcRequest<unknown, SchoolIdBase>) {
    return StatsService.getEnrollmentStatsByYear(schoolId);
  }
}
