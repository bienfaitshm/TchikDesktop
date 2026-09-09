import {
  searchEngine,
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

export class SearchEngineController {
  private static searchEngine: InternalSearchEngine = searchEngine;
  @IpcServer.register(HttpMethod.GET, SearchRoutes.homeSearch, {
    params: SearchEngineParamsSchema,
  })
  static async getSuggestions({
    params,
  }: IpcRequest<unknown, SearchEngineParams>) {
    return SearchEngineController.searchEngine.search(
      params.search,
      { schoolId: params.schoolId, yearId: params.yearId },
      params.limit,
    );
  }
}
