import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useId, useRef, useEffect } from "react";
import type { BaseMutationConfig } from "./types";

export function useFormBase<TData = unknown>(
  config?: BaseMutationConfig<TData>,
) {
  const formId = useId();
  const queryClient = useQueryClient();
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const notifyAndInvalidate = useCallback(
    (data: TData) => {
      const currentConfig = configRef.current;

      if (currentConfig?.mutationKey) {
        queryClient.invalidateQueries({ queryKey: currentConfig.mutationKey });
      }

      currentConfig?.onSuccess?.(data);
    },
    [queryClient],
  );

  return {
    formId,
    notifyAndInvalidate,
  };
}
