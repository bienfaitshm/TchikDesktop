import React from "react";
import type { DialogItemConfig, DialogRenderProps } from "./types";

interface DialogMenuState {
  activeDialogKey: string | null;
}

interface DialogMenuActions {
  showDialog(key: string): void;
  closeDialog(): void;
  handleOpenChange(open: boolean): void;
}

const DialogStateContext = React.createContext<DialogMenuState | null>(null);
DialogStateContext.displayName = "DialogStateContext";

const DialogActionContext = React.createContext<DialogMenuActions | null>(null);
DialogActionContext.displayName = "DialogActionContext";

/**
 * Contextual boundary coordinating dialog visibility state tracking.
 * @param props - Children nodes demanding context subscription dependencies.
 * @returns Wrapped component architectures feeding rendering state.
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
DialogMenuProvider.displayName = "DialogMenuProvider";

interface DialogContainerProps<T = unknown> {
  contextProps: T;
  items?: Map<string, DialogItemConfig<T>["renderDialog"]>;
}

/**
 * Evaluates mapping parameters to render conditionally invoked overlay layouts.
 * @param props - Contextual properties carrying active identifiers and render callbacks.
 * @returns Evaluated React elements correlating strictly to the current active key.
 */
export const DialogContainer = <T extends Record<string, unknown>>({
  items,
  contextProps,
}: DialogContainerProps<T>): React.ReactElement | null => {
  const { activeDialogKey } = useDialogState();
  const { closeDialog, handleOpenChange } = useDialogActions();

  if (!activeDialogKey || !items) return null;

  const renderDialog = items.get(activeDialogKey);

  if (renderDialog) {
    const dialogProps: DialogRenderProps<T> = {
      props: contextProps,
      open: true,
      close: closeDialog,
      onOpenChange: handleOpenChange,
    };

    return <>{renderDialog(dialogProps)}</>;
  }

  return null;
};
DialogContainer.displayName = "DialogContainer";

/**
 * Retrieves the read-only operational state of structural visibility contexts.
 * @throws When called physically outside of `DialogMenuProvider` hierarchies.
 * @returns Current state holding the active dialog key.
 */
export function useDialogState(): DialogMenuState {
  const context = React.useContext(DialogStateContext);
  if (!context) {
    throw new Error("useDialogState must be used within a DialogMenuProvider");
  }
  return context;
}

/**
 * Accesses operational dispatch functions driving UI mutation logic interactively.
 * @throws When called physically outside of `DialogMenuProvider` hierarchies.
 * @returns Hooks mapped specifically to orchestrate active overlays.
 */
export function useDialogActions(): DialogMenuActions {
  const context = React.useContext(DialogActionContext);
  if (!context) {
    throw new Error(
      "useDialogActions must be used within a DialogMenuProvider",
    );
  }
  return context;
}
