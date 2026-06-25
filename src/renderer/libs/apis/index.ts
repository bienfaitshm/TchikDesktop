import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import * as apis from "@/packages/@core/apis/clients";
import type { IpcRenderer } from "@electron-toolkit/preload";

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
} as const;

export type AppClients = {
  readonly [K in keyof typeof API_REGISTRY]: ReturnType<
    (typeof API_REGISTRY)[K]
  >;
};

export function createLazyAppClients(
  ipcRendererInstance: IpcRenderer,
): AppClients {
  const ipcClient = new IpcClient(ipcRendererInstance);

  const cache: Partial<Record<keyof AppClients, any>> = {};

  return new Proxy({} as AppClients, {
    get(target, prop: string | symbol) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop);
      }

      if (!Object.prototype.hasOwnProperty.call(API_REGISTRY, prop)) {
        return undefined;
      }

      const key = prop as keyof AppClients;

      if (!cache[key]) {
        const factory = (API_REGISTRY as any)[key];
        if (typeof factory === "function") {
          cache[key] = factory(ipcClient);
          console.log(`[LazyAPI] Initialized client: ${String(prop)}`);
        }
      }

      return cache[key];
    },
    set() {
      return false;
    },
    ownKeys() {
      return Reflect.ownKeys(API_REGISTRY);
    },
    getOwnPropertyDescriptor(_, prop) {
      return {
        enumerable: true,
        configurable: true,
        value: undefined,
        prop,
      };
    },
  });
}

export const api = createLazyAppClients(window.electron.ipcRenderer);

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
} = api;
