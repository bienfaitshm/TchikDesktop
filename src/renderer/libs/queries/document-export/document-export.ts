import type { DocumentMetadata } from "@/packages/electron-data-exporter";
import { useMutation, useSuspenseQuery } from "../base";
import { exportDocuments as exportApi } from "@/renderer/libs/apis";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

export type ExportParams = Record<string, unknown>;

export interface ExportPayload<
  TBody = unknown,
  TParams extends ExportParams = ExportParams,
> {
  params?: TParams;
  data: TBody;
}

export const exportKeys = {
  all: ["documents-export"] as const,
  available: (params?: ExportParams) =>
    [...exportKeys.all, "available", { params }] as const,
  mutations: {
    execute: () => [...exportKeys.all, "execute"] as const,
  },
} as const;

export function useExportDocuments<
  TBody = unknown,
  TParams extends ExportParams = ExportParams,
>(
  options?: Partial<
    UseMutationOptions<string, Error, ExportPayload<TBody, TParams>>
  >,
) {
  return useMutation({
    mutationKey: exportKeys.mutations.execute(),
    mutationFn: ({ data, params }: ExportPayload<TBody, TParams>) =>
      exportApi.executeExport(data, params),
    ...options,
  });
}

export function useAvailableExports<
  TParams extends ExportParams = ExportParams,
>(
  params?: TParams,
  options?: Partial<
    UseSuspenseQueryOptions<DocumentMetadata<unknown>[], any, any>
  >,
) {
  return useSuspenseQuery({
    queryKey: exportKeys.available(params),
    queryFn: () => exportApi.getAvailableExports(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}
