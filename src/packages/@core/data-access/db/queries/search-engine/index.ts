import { db } from "../../config";
import { InternalSearchEngine } from "./internal-search-engine";
import { StudentSearchStrategy } from "./search-strategy";
export * from "./types";
export * from "./internal-search-engine";
export * from "./search-strategy";

export const searchEngine = new InternalSearchEngine([
  new StudentSearchStrategy(db),
]);
