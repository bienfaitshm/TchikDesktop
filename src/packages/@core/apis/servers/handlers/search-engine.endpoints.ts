import {
  searchEngine as defaultSearchEngine,
  type InternalSearchEngine,
} from "@/packages/@core/data-access/db/queries";
import {
  SearchEngineParamsSchema,
  type SearchEngineParams,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { SearchRoutes } from "../../routes-constant";

/**
 * Controller exposing internal search engine functionality over IPC REST routes.
 */
export class SearchEngineController {
  private static searchEngineInstance: InternalSearchEngine =
    defaultSearchEngine;

  /**
   * Sets the search engine instance used by the controller handlers (useful for dependency injection and testing).
   * @param engine - The InternalSearchEngine instance to inject.
   */
  public static setSearchEngine(engine: InternalSearchEngine): void {
    SearchEngineController.searchEngineInstance = engine;
  }

  /**
   * Handles incoming IPC requests to retrieve search suggestions based on search query and context.
   * @param request - IPC Request containing validated SearchEngineParams.
   * @returns Array of search suggestion objects matching the query.
   */
  @IpcServer.register(HttpMethod.GET, SearchRoutes.homeSearch, {
    params: SearchEngineParamsSchema,
  })
  public static async getSuggestions({
    params,
  }: IpcRequest<unknown, SearchEngineParams>) {
    return SearchEngineController.searchEngineInstance.search(
      params.search,
      { schoolId: params.schoolId, yearId: params.yearId },
      params.limit,
    );
  }

  /**
   * Handles incoming IPC requests to fetch detailed preview information for a single user.
   * @param request - IPC Request containing validated SearchEngineParams with target user ID in search param.
   * @returns Detailed preview data for the specified user, or null if not found.
   */
  @IpcServer.register(HttpMethod.GET, SearchRoutes.detailSearch, {
    params: SearchEngineParamsSchema,
  })
  public static async getPreviewOfUser({
    params,
  }: IpcRequest<unknown, SearchEngineParams>) {
    return SearchEngineController.searchEngineInstance.getPreviewOfUser(
      { schoolId: params.schoolId, yearId: params.yearId },
      params.search,
    );
  }
}
