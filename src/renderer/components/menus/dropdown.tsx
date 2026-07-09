import type { FC, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useState } from "react";
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import type {
  ComponentRenderFn,
  MenuTriggerState,
  HTMLProps,
} from "@base-ui/react";
import { cn } from "@/renderer/utils";

type DialogState = {
  openDialogId: string | null;
  openDialog: (id: string) => void;
  closeDialog: () => void;
};

const MenuDialogContext = createContext<DialogState | undefined>(undefined);

export const useMenuDialog = () => {
  const ctx = useContext(MenuDialogContext);
  if (!ctx) throw new Error("useMenuDialog must be used within an ActionMenu");
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
  typeof DropdownMenuItem
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
    <DropdownMenuItem
      {...props}
      onClick={(e) => {
        e.preventDefault();
        onSelect?.(e);
        ctx.openDialog(targetId);
      }}
    />
  );
};

type ActionMenuProps = {
  trigger:
    | ReactElement<unknown, string | React.JSXElementConstructor<any>>
    | ComponentRenderFn<HTMLProps, MenuTriggerState>;
  children: React.ReactNode;
  dialogs?: React.ReactNode;
  className?: string;
};

export const ActionMenu: FC<ActionMenuProps> = ({
  trigger,
  children,
  dialogs,
  className,
}) => {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const openDialog = useCallback((id: string) => setOpenDialogId(id), []);
  const closeDialog = useCallback(() => setOpenDialogId(null), []);
  return (
    <MenuDialogContext.Provider
      value={{ openDialogId, openDialog, closeDialog }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger render={trigger} />
        <DropdownMenuContent className={cn("min-w-xs", className)}>
          {children}
        </DropdownMenuContent>
        {dialogs}
      </DropdownMenu>
    </MenuDialogContext.Provider>
  );
};
