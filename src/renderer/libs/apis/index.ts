import { IpcClient } from "@/packages/electron-ipc-rest";
import * as apis from "@/packages/@core/apis/clients";
import type { IpcRenderer } from "@electron-toolkit/preload";

const API_REGISTRY = {
  users: apis.createUserApis,
  classroom: apis.createClassroomApis,
  enrollement: apis.createEnrollementApis,
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

function createLazyAppClients(ipcRendererInstance: IpcRenderer): AppClients {
  const ipcClient = new IpcClient(ipcRendererInstance);

  const cache: Partial<AppClients> = {};

  return new Proxy({} as AppClients, {
    get(_, prop: string) {
      // 1. Vérifier si la propriété demandée existe dans notre registre
      if (!(prop in API_REGISTRY)) {
        return undefined;
      }

      const key = prop as keyof typeof API_REGISTRY;

      if (!cache[key]) {
        const factory = API_REGISTRY[key];
        // @ts-ignore : Typage dynamique complexe pour le cache
        cache[key] = factory(ipcClient);
        console.log(`[LazyAPI] Initialized client: ${key}`);
      }

      return cache[key];
    },
    set() {
      return false;
    },
  });
}

export const api = createLazyAppClients(window.electron.ipcRenderer);

export const {
  classroom,
  enrollement,
  option,
  school,
  exportDocuments,
  stats,
  appInfos,
  users,
  seating,
} = api;
