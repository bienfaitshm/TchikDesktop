import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type { SchoolYearIdBase } from "@/packages/@core/data-access/schema-validations";
import type { FinDashBoard } from "@/packages/@core/data-access/db";
import { DashboardRoutes } from "../routes-constant";

/**
 * Read-only contract defining available financial dashboard API endpoints.
 */
export type DashboardApis = Readonly<{
  /**
   * Fetches financial dashboard statistics for a given school and academic year.
   * @param params - Scope parameters containing schoolId and yearId.
   * @returns A promise resolving to the financial dashboard payload.
   */
  getFinancialDashboardData(params: SchoolYearIdBase): Promise<FinDashBoard>;
}>;

/**
 * Factory creating API service methods for financial dashboard interactions over IPC.
 * @param ipcClient - The IPC client instance used to execute remote calls.
 * @returns An immutable object exposing dashboard API operations.
 */
export function createDashboardApis(ipcClient: IpcClient): DashboardApis {
  return {
    getFinancialDashboardData(params) {
      return ipcClient.get(DashboardRoutes.FIN_DASHBOARD, { params });
    },
  };
}
