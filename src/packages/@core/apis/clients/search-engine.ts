import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type { SearchEngineParams } from "@/packages/@core/data-access/schema-validations";
import type {
  SearchSuggestion,
  Preview,
} from "@/packages/@core/data-access/db";
import { SearchRoutes } from "../routes-constant";

/**
 * Defines the contract for client-side search engine IPC API operations.
 */
export type SearchEngineApi = Readonly<{
  /**
   * Triggers a global search query and retrieves structured suggestions.
   * @param params - Search parameters including term, school, year, and limit.
   * @returns Resolves to an array of matching search suggestions.
   */
  search(params: SearchEngineParams): Promise<SearchSuggestion[]>;

  /**
   * Fetches detailed preview information for a specific user ID.
   * @param params - Parameters containing target user ID in search field along with context.
   * @returns Resolves to the user Preview object or null if not found.
   */
  getPreviewOfUser(params: SearchEngineParams): Promise<Preview | null>;
}>;

/**
 * Factory function creating a SearchEngineApi client bound to an IPC client instance.
 * @param ipcClient - The HTTP/IPC client used to execute requests.
 * @returns An implementation of SearchEngineApi routing requests to IPC search endpoints.
 */
export function createSearchEngineApis(ipcClient: IpcClient): SearchEngineApi {
  return {
    search(params: SearchEngineParams): Promise<SearchSuggestion[]> {
      return ipcClient.get<SearchSuggestion[]>(SearchRoutes.homeSearch, {
        params,
      });
    },
    getPreviewOfUser(params: SearchEngineParams): Promise<Preview | null> {
      return ipcClient.get<Preview | null>(SearchRoutes.detailSearch, {
        params,
      });
    },
  };
}
