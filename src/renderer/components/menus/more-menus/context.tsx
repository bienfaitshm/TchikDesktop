import React from "react";
import type { DialogItemConfig } from "./types";

interface DialogMenuState {
  activeDialogKey: string | null;
}

interface DialogMenuActions {
  showDialog(key: string): void;
  closeDialog(): void;
  handleOpenChange(open: boolean): void;
}

const DialogStateContext = React.createContext<DialogMenuState | null>(null);
const DialogActionContext = React.createContext<DialogMenuActions | null>(null);

/**
 * Provides state management and action handlers for active dialog menus.
 * @param props - React properties containing child elements.
 * @returns The context providers wrapping the children.
 */
export const DialogMenuProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [activeDialogKey, setActiveDialogKey] = React.useState<string | null>(
    null,
  );

  const showDialog = React.useCallback((key: string) => {
    setActiveDialogKey(key);
  }, []);

  const closeDialog = React.useCallback(() => {
    setActiveDialogKey(null);
  }, []);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) closeDialog();
    },
    [closeDialog],
  );

  const actionValue = React.useMemo(
    () => ({ showDialog, closeDialog, handleOpenChange }),
    [showDialog, closeDialog, handleOpenChange],
  );

  return (
    <DialogStateContext.Provider value={{ activeDialogKey }}>
      <DialogActionContext.Provider value={actionValue}>
        {children}
      </DialogActionContext.Provider>
    </DialogStateContext.Provider>
  );
};

interface DialogContainerProps<T = unknown> {
  contextProps: T;
  items?: Map<string, DialogItemConfig<T>["renderDialog"]>;
}

/**
 * Renders the active dialog component corresponding to the current context state.
 * @param props - Properties including dialog items and context payload.
 * @returns The rendered active dialog element or null if none is active.
 */
export const DialogContainer = <T extends {}>({
  items,
  contextProps,
}: DialogContainerProps<T>): React.ReactElement | null => {
  const { activeDialogKey } = useDialogState();
  const { closeDialog, handleOpenChange } = useDialogActions();

  if (!activeDialogKey || !items) return null;

  const renderDialog = items.get(activeDialogKey);

  if (renderDialog) {
    return (
      <>
        {renderDialog({
          props: contextProps,
          open: true,
          close: closeDialog,
          onOpenChange: handleOpenChange,
        } as any)}
      </>
    );
  }

  return null;
};

/**
 * Custom hook safely consuming the DialogStateContext.
 * @throws Error if used outside of a DialogMenuProvider.
 * @returns The active DialogMenuState object.
 */
export function useDialogState(): DialogMenuState {
  const context = React.useContext(DialogStateContext);
  if (!context)
    throw new Error("useDialogState must be used within a DialogMenuProvider");
  return context;
}

/**
 * Custom hook safely consuming the DialogActionContext.
 * @throws Error if used outside of a DialogMenuProvider.
 * @returns The active DialogMenuActions object.
 */
export function useDialogActions(): DialogMenuActions {
  const context = React.useContext(DialogActionContext);
  if (!context)
    throw new Error(
      "useDialogActions must be used within a DialogMenuProvider",
    );
  return context;
}
