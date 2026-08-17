import { financialStatisticsService } from "@/packages/@core/data-access/db/queries";
import {
  type SchoolYearIdBase,
  schoolYearIdBaseSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { DashboardRoutes } from "../../routes-constant";

/**
 * Controller handling IPC requests for dashboard domain features.
 */
export class DashboardController {
  /**
   * Retrieves financial statistics for a specific school and academic year.
   * @param req - IPC request containing schoolId and yearId in params.
   * @returns Aggregated financial dashboard data for the requested scope.
   */
  @IpcServer.register(HttpMethod.GET, DashboardRoutes.FIN_DASHBOARD, {
    params: schoolYearIdBaseSchema,
  })
  static async getFinancialDashboard(
    req: IpcRequest<unknown, SchoolYearIdBase>,
  ) {
    const { schoolId, yearId } = req.params;
    return financialStatisticsService.getDashboardData(schoolId, yearId);
  }
}
