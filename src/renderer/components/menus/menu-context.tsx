import type { FC, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/renderer/components/ui/context-menu";

type DialogState = {
  openDialogId: string | null;
  openDialog: (id: string) => void;
  closeDialog: () => void;
};

const MenuDialogContext = createContext<DialogState | undefined>(undefined);

export const useMenuDialog = () => {
  const ctx = useContext(MenuDialogContext);
  if (!ctx)
    throw new Error("useMenuDialog must be used within an ActionContextMenu");
  return ctx;
};

type MenuDialogWrapperProps = {
  id: string;
  children: ReactElement;
};

export const MenuDialogWrapper: FC<MenuDialogWrapperProps> = ({
  children,
  id,
}) => {
  const ctx = useMenuDialog();

  if (!React.isValidElement(children)) return null;

  return React.cloneElement(children, {
    open: ctx.openDialogId === id,
    onOpenChange: (open: boolean) => {
      if (!open) ctx.closeDialog();
    },
  } as React.Attributes & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  });
};

type MenuDialogItemProps = React.ComponentPropsWithoutRef<
  typeof ContextMenuItem
> & {
  targetId: string;
};

export const MenuDialogItem: FC<MenuDialogItemProps> = ({
  targetId,
  onSelect,
  ...props
}) => {
  const ctx = useMenuDialog();

  return (
    <ContextMenuItem
      {...props}
      onSelect={(e) => {
        e.preventDefault();
        onSelect?.(e);
        ctx.openDialog(targetId);
      }}
    />
  );
};

type ActionContextMenuProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  dialogs?: React.ReactNode;
};

export const ActionContextMenu: FC<ActionContextMenuProps> = ({
  trigger,
  children,
  dialogs,
}) => {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const openDialog = useCallback((id: string) => setOpenDialogId(id), []);
  const closeDialog = useCallback(() => setOpenDialogId(null), []);

  return (
    <MenuDialogContext.Provider
      value={{ openDialogId, openDialog, closeDialog }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>

        <ContextMenuContent>{children}</ContextMenuContent>
        {dialogs}
      </ContextMenu>
    </MenuDialogContext.Provider>
  );
};
