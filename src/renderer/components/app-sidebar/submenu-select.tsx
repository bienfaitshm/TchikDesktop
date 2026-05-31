"use client";

import React, { PropsWithChildren } from "react";
import { Link, LinkProps } from "react-router";
import { Check, PlusCircle } from "lucide-react";
import {
  MenubarItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@/renderer/components/ui/menubar";

export type MenuSelectProps<TData> = {
  items: TData[];
  selectedValue?: string;
  emptyMessage?: string;
  getItemProps: (item: TData) => {
    id: string;
    label: string;
    subLabel?: string;
  };
  onSelectItem: (item: TData) => void;
};

export type MenuSelectItemProps = {
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
};

export type SubMenuSelectProps = {
  title: string;
  subTitle?: string;
  ariaLabel?: string;
};

export type MenubarLinkActionProps = Pick<LinkProps, "to"> & {};

export function MenuSelect<TData extends object>({
  items,
  selectedValue,
  emptyMessage = "Aucune option disponible",
  getItemProps,
  onSelectItem,
}: MenuSelectProps<TData>) {
  if (items.length === 0) {
    return (
      <MenubarItem
        disabled
        className="text-muted-foreground/70 italic text-sm py-2 px-3 focus:bg-transparent"
      >
        {emptyMessage}
      </MenubarItem>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const { id, label, subLabel } = getItemProps(item);
        const isSelected = id === selectedValue;
        const itemKey = id || `menu-item-${index}`;

        return (
          <MenuSelectItem
            key={itemKey}
            onSelect={() => onSelectItem(item)}
            isSelected={isSelected}
            label={label}
            subLabel={subLabel}
          />
        );
      })}
    </>
  );
}

export function MenuSelectItem({
  label,
  subLabel,
  icon,
  isSelected = false,
  onSelect,
}: MenuSelectItemProps) {
  return (
    <MenubarItem
      role="menuitemcheckbox"
      aria-checked={isSelected}
      onSelect={(e) => {
        e.preventDefault();
        onSelect?.();
      }}
      className="flex items-center justify-between py-2 px-3 cursor-pointer rounded-md transition-colors text-sm focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <div className="flex items-center gap-3 text-left片段">
        {icon && (
          <div
            className="size-4 shrink-0 text-muted-foreground flex items-center justify-center"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{label}</span>
          {subLabel && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <Check
          className="size-4 text-primary shrink-0 ml-2 animate-in zoom-in-50 duration-200"
          aria-hidden="true"
        />
      )}
    </MenubarItem>
  );
}

/**
 * SubMenuSelect - Conteneur pour créer des sous-menus complexes
 */
export function SubMenuSelect({
  title,
  subTitle,
  ariaLabel,
  children,
}: PropsWithChildren<SubMenuSelectProps>) {
  return (
    <MenubarSub>
      <MenubarSubTrigger className="py-2 px-3 flex items-center justify-between feedback-trigger">
        <div className="flex flex-col flex-1 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {subTitle && (
            <span
              className="text-xs text-foreground font-medium truncate max-w-[180px] mt-0.5"
              aria-live="polite"
            >
              {subTitle}
            </span>
          )}
        </div>
      </MenubarSubTrigger>

      <MenubarSubContent
        className="min-w-[260px] rounded-lg p-1 shadow-md"
        sideOffset={8}
        alignOffset={-4}
        aria-label={ariaLabel}
      >
        {children}
      </MenubarSubContent>
    </MenubarSub>
  );
}

export function MenubarLinkAction({
  to,
  children,
}: PropsWithChildren<MenubarLinkActionProps>) {
  return (
    <MenubarItem
      className="text-muted-foreground hover:text-foreground focus:bg-accent focus:text-accent-foreground text-xs py-2 px-3 font-medium cursor-pointer rounded-md gap-2"
      asChild
    >
      <Link to={to}>
        <PlusCircle className="size-4 shrink-0" aria-hidden="true" />
        <span>{children}</span>
      </Link>
    </MenubarItem>
  );
}
