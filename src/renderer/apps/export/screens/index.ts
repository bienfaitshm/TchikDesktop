import { lazyNamed } from "@/renderer/utils/react";

export const ExportDocumentPage = lazyNamed(
  () => import("./export-document"),
  "ExportDocumentPage",
);
