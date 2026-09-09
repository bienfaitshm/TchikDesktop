import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type { SearchEngineParams } from "@/packages/@core/data-access/schema-validations";

import { SearchRoutes } from "../routes-constant";
import type { SearchSuggestion } from "@/packages/@core/data-access/db";

export type SearchEngineApi = Readonly<{
  search(params: SearchEngineParams): Promise<SearchSuggestion[][]>;
}>;

export function createSearchEngineApis(ipcClient: IpcClient): SearchEngineApi {
  return {
    search(params) {
      return ipcClient.get(SearchRoutes.homeSearch, { params });
    },
  } as const;
}
