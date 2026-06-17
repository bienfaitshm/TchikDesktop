import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useId } from "react";
import type { BaseMutationConfig } from "./types";

export function useFormBase<T extends BaseMutationConfig = {}>(config?: T) {
  const formId = useId();
  const queryClient = useQueryClient();

  const notifyAndInvalidate = useCallback(
    (data: T) => {
      if (config?.mutationKeys) {
        queryClient.invalidateQueries({ queryKey: config.mutationKeys });
      }
      config?.onSuccess?.(data);
    },
    [queryClient, config],
  );

  return {
    formId,
    notifyAndInvalidate,
  };
}
