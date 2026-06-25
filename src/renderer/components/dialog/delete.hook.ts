import { useCallback } from "react";

interface UseAsyncConfirmProps<TId = string, TArgs extends any[] = any[]> {
  id: TId;
  onConfirmAction: (id: TId, ...args: TArgs) => Promise<any> | void;
  onOpenConfirm: (id: TId) => void;
  onCloseConfirm: () => void;
  actionArgs?: TArgs;
  errorMessage?: string;
}

export const useAsyncConfirm = <TId = string, TArgs extends any[] = any[]>({
  id,
  onConfirmAction,
  onOpenConfirm,
  onCloseConfirm,
  actionArgs = [] as unknown as TArgs,
  errorMessage = "Une erreur est survenue lors de l'action.",
}: UseAsyncConfirmProps<TId, TArgs>) => {
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirmAction(id, ...actionArgs);
    } catch (error) {
      console.error(errorMessage, error);
    }
  }, [id, onConfirmAction, actionArgs, errorMessage]);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onOpenConfirm(id);
    },
    [onOpenConfirm, id],
  );

  return {
    handleConfirm,
    handleTriggerClick,
  };
};
