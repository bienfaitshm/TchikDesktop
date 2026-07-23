import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import * as apis from "@/packages/@core/apis/clients";

/**
 * Registry mapping domain keys to their respective API client factory functions.
 */
const API_REGISTRY = {
  users: apis.createUserApis,
  classroom: apis.createClassroomApis,
  enrollment: apis.createEnrollmentApis,
  option: apis.createOptionApis,
  school: apis.createSchoolApis,
  stats: apis.createStatsApis,
  exportDocuments: apis.createDocumentExportApis,
  appInfos: apis.createAppInfosApis,
  seating: apis.createSeatingApis,
  wallet: apis.createWalletApis,
  feeType: apis.createFeeTypeApis,
  feeSchedule: apis.createFeeScheduleApis,
  feeConfiguration: apis.createFeeConfigurationApis,
  feeAssignment: apis.createFeeAssignmentApis,
  studentPayment: apis.createStudentPaymentApis,
  dailyExchangeRate: apis.createDailyExchangeRateApis,
  payment: apis.createPaymentApis,
  dashboard: apis.createDashboardApis,
} as const;

type ApiRegistry = typeof API_REGISTRY;

/**
 * Mapped type representing all available domain API client instances.
 */
export type AppClients = {
  readonly [K in keyof ApiRegistry]: ReturnType<ApiRegistry[K]>;
};

/**
 * Creates a lazy-loaded application API client proxy.
 *
 * @param ipcClient - The IPC client instance passed to API factories upon initialization.
 * @returns A proxy object exposing lazily-instantiated domain API clients.
 */
export function createLazyAppClients(ipcClient: IpcClient): AppClients {
  const cache: Partial<AppClients> = {};

  return new Proxy({} as AppClients, {
    get(target, prop: string | symbol) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop);
      }

      if (!Object.prototype.hasOwnProperty.call(API_REGISTRY, prop)) {
        return undefined;
      }

      const key = prop as keyof ApiRegistry;

      if (!cache[key]) {
        const factory = API_REGISTRY[key];
        cache[key] = factory(ipcClient) as AppClients[typeof key];
      }

      return cache[key];
    },

    set() {
      return false;
    },

    ownKeys() {
      return Reflect.ownKeys(API_REGISTRY);
    },

    getOwnPropertyDescriptor(_, prop: string | symbol) {
      if (typeof prop === "string" && prop in API_REGISTRY) {
        return {
          enumerable: true,
          configurable: true,
          writable: false,
        };
      }
      return undefined;
    },
  });
}

/**
 * Default IPC client connected to the Electron renderer process.
 */
export const apiClient = new IpcClient(window.electron.ipcRenderer);

/**
 * Singleton proxy providing access to lazily initialized domain API clients.
 */
export const api = createLazyAppClients(apiClient);

export const {
  classroom,
  enrollment,
  option,
  school,
  exportDocuments,
  stats,
  appInfos,
  users,
  seating,
  wallet,
  feeType,
  feeSchedule,
  feeConfiguration,
  feeAssignment,
  studentPayment,
  dailyExchangeRate,
  payment,
  dashboard,
} = api;
