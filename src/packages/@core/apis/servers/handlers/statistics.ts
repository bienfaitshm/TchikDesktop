import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { StatsRoutes } from "../../routes-constant";
import { StatsService } from "@/packages/@core/data-access/db/queries";
import { StatsFilterSchema } from "@/packages/@core/data-access/schema-validations";

const SchoolIdFilterSchema = StatsFilterSchema.pick({ schoolId: true });

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
    params: StatsFilterSchema,
  })
  static async getSummary(req: IpcRequest) {
    return StatsService.getQuickKpis(req.params);
  }

  /**
   * Retrieves student distribution metrics grouped by registration status.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to status distribution data arrays.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_STATUS, {
    params: StatsFilterSchema,
  })
  static async getByStatus(req: IpcRequest) {
    return StatsService.getStudentStatusStats(req.params);
  }

  /**
   * Extracts absolute school-wide student distributions categorized by gender.
   * @param req - The IPC request context holding primary school identification parameters.
   * @returns A promise resolving to global institutional gender statistics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_GENDER, {
    params: SchoolIdFilterSchema,
  })
  static async getByGender(req: IpcRequest) {
    return StatsService.getGenderDistribution(req.params);
  }

  /**
   * Compiles enrollment headcount records structured per distinct classroom space.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to classroom occupancy volume metrics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_CLASS, {
    params: StatsFilterSchema,
  })
  static async getByClass(req: IpcRequest) {
    return StatsService.getStudentsCountByClass(req.params);
  }

  /**
   * Fetches total student enrollment numbers grouped by selected study options.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to specialized study option volume metrics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.STUDENTS_BY_OPTION, {
    params: StatsFilterSchema,
  })
  static async getByOption(req: IpcRequest) {
    return StatsService.getStudentsCountByOption(req.params);
  }

  /**
   * Processes student body retention indexes contrasting current and historical cycles.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to structural school retention statistics.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.RETENTION, {
    params: StatsFilterSchema,
  })
  static async getRetention(req: IpcRequest) {
    return StatsService.getRetentionMetrics(req.params);
  }

  /**
   * Returns a baseline total aggregate count of all students inside a specific boundary.
   * @param req - The IPC request context carrying target statistics filters.
   * @returns A promise resolving to the absolute numeric volume of students.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.TOTAL_STUDENTS, {
    params: StatsFilterSchema,
  })
  static async getTotalStudents(req: IpcRequest) {
    return StatsService.getTotalStudents(req.params);
  }

  /**
   * Tracks long-term chronological student registration trends mapped over multiple years.
   * @param req - The IPC request context holding primary school identification parameters.
   * @returns A promise resolving to historical multi-year enrollment growth datasets.
   */
  @IpcServer.register(HttpMethod.GET, StatsRoutes.ENROLLMENTS_BY_YEAR, {
    params: SchoolIdFilterSchema,
  })
  static async getEnrollmentsByYear(req: IpcRequest) {
    return StatsService.getEnrollmentStatsByYear(req.params);
  }
}
