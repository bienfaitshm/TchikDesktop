import { IpcClient } from "@/packages/electron-ipc-rest";
import type { SystemInformation } from "@/packages/@core/apis/servers/apps-infos";
import { AppInfosRoutes } from "../routes-constant";

export type ClassroomApi = Readonly<{
  fetchSystemInfos(): Promise<SystemInformation>;
}>;

export function createClassroomApis(ipcClient: IpcClient): ClassroomApi {
  return {
    fetchSystemInfos() {
      return ipcClient.get(AppInfosRoutes.SYS_INFOS, {});
    },
  } as const;
}
