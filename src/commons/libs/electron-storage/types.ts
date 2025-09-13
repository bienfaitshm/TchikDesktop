import { ELECTRON_STORAGE_ROUTE_ACTION } from "./constant";

export type DataStorage =
  | {
      action:
        | ELECTRON_STORAGE_ROUTE_ACTION.getItem
        | ELECTRON_STORAGE_ROUTE_ACTION.removeItem;
    }
  | { action: ELECTRON_STORAGE_ROUTE_ACTION.setItem; value: unknown };
