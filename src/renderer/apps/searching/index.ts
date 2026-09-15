import { lazyNamed } from "@/renderer/utils/react";

export const HomeSearch = lazyNamed(
  () => import("@/renderer/apps/searching/screens/search"),
  "HomeSearch",
);

export const SearchResult = lazyNamed(
  () => import("@/renderer/apps/searching/screens/search-result"),
  "ResultSearch",
);
