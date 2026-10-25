import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { DialogItemConfig, DialogRenderProps } from "./types";

/**
 * State structure holding the currently active dialog key identifier.
 */
export interface DialogMenuState {
  activeDialogKey: string | null;
}

/**
 * Action methods available for manipulating dialog visibility states.
 */
export interface DialogMenuActions {
  showDialog: (key: string) => void;
  closeDialog: () => void;
  handleOpenChange: (open: boolean) => void;
}

/**
 * Props for the DialogMenuProvider component.
 */
export interface DialogMenuProviderProps {
  children: React.ReactNode;
}

const DialogStateContext = createContext<DialogMenuState | null>(null);
DialogStateContext.displayName = "DialogStateContext";

const DialogActionContext = createContext<DialogMenuActions | null>(null);
DialogActionContext.displayName = "DialogActionContext";

/**
 * Context boundary component coordinating dialog visibility tracking across the menu ecosystem.
 * @param props - The component props containing children nodes.
 * @returns Wrapped component hierarchy providing dialog states and actions.
 */
export const DialogMenuProvider: React.FC<DialogMenuProviderProps> = ({
  children,
}) => {
  const [activeDialogKey, setActiveDialogKey] = useState<string | null>(null);

  const showDialog = useCallback((key: string) => {
    setActiveDialogKey(key);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialogKey(null);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  const actionValue = useMemo(
    () => ({ showDialog, closeDialog, handleOpenChange }),
    [showDialog, closeDialog, handleOpenChange],
  );

  const stateValue = useMemo(() => ({ activeDialogKey }), [activeDialogKey]);

  return (
    <DialogStateContext.Provider value={stateValue}>
      <DialogActionContext.Provider value={actionValue}>
        {children}
      </DialogActionContext.Provider>
    </DialogStateContext.Provider>
  );
};
DialogMenuProvider.displayName = "DialogMenuProvider";

/**
 * Properties for the DialogContainer component.
 * @template T - Context properties record type.
 */
export interface DialogContainerProps<TProps> {
  contextProps: TProps;
  items?: Map<string, DialogItemConfig<TProps>["renderDialog"]>;
}

/**
 * Renders conditionally invoked overlay layouts based on the active dialog identifier.
 * @template T - Context properties record type.
 * @param props - Container properties carrying items map and context values.
 * @returns Evaluated React elements correlating to the active dialog key or null.
 */
export const DialogContainer = <TProps extends {} = {}>({
  items,
  contextProps,
}: DialogContainerProps<TProps>): React.ReactElement | null => {
  const { activeDialogKey } = useDialogState();
  const { closeDialog, handleOpenChange } = useDialogActions();

  if (!activeDialogKey || !items) {
    return null;
  }

  const renderDialog = items.get(activeDialogKey);

  if (!renderDialog) {
    return null;
  }

  const dialogProps: DialogRenderProps<TProps> = {
    props: contextProps,
    open: true,
    close: closeDialog,
    onOpenChange: handleOpenChange,
  };

  return <>{renderDialog(dialogProps)}</>;
};
DialogContainer.displayName = "DialogContainer";

/**
 * Retrieves the read-only operational state of structural visibility contexts.
 * @throws When called outside of a DialogMenuProvider hierarchy.
 * @returns Current state holding the active dialog key.
 */
export function useDialogState(): DialogMenuState {
  const context = useContext(DialogStateContext);
  if (!context) {
    throw new Error("useDialogState must be used within a DialogMenuProvider");
  }
  return context;
}

/**
 * Accesses operational dispatch functions driving UI mutation logic interactively.
 * @throws When called outside of a DialogMenuProvider hierarchy.
 * @returns Methods mapped specifically to orchestrate active overlays.
 */
export function useDialogActions(): DialogMenuActions {
  const context = useContext(DialogActionContext);
  if (!context) {
    throw new Error(
      "useDialogActions must be used within a DialogMenuProvider",
    );
  }
  return context;
}
