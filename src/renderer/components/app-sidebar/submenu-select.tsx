"use client";

import React, { createContext, useContext } from "react";
import { Check, type LucideIcon } from "lucide-react";
import {
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarItem,
} from "@/renderer/components/ui/menubar";

// ==========================================
// 1. Context React pour la Composition
// ==========================================

interface SelectSubMenuContextValue<T extends string = string> {
  selectedValue: T;
  onValueChange: (value: T) => void;
}

const SelectSubMenuContext = createContext<SelectSubMenuContextValue | null>(
  null,
);

function useSelectSubMenu() {
  const context = useContext(SelectSubMenuContext);
  if (!context) {
    throw new Error(
      "Les sous-composants de SelectSubMenu doivent être utilisés à l'intérieur de <SelectSubMenu />",
    );
  }
  return context;
}

// ==========================================
// 2. Composants Composables (Compound Components)
// ==========================================

export interface SelectSubMenuProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  children: React.ReactNode;
}

/** Racine qui fournit le contexte d'état */
export function SelectSubMenu<T extends string>({
  value,
  onValueChange,
  children,
}: SelectSubMenuProps<T>) {
  return (
    <SelectSubMenuContext.Provider
      value={{
        selectedValue: value,
        onValueChange: onValueChange as (v: string) => void,
      }}
    >
      <MenubarSub>{children}</MenubarSub>
    </SelectSubMenuContext.Provider>
  );
}

export interface SelectSubMenuTriggerProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

/** Déclencheur du sous-menu */
export function SelectSubMenuTrigger({
  icon: Icon,
  children,
  className = "",
}: SelectSubMenuTriggerProps) {
  return (
    <MenubarSubTrigger
      className={`flex items-center gap-3 cursor-pointer py-2 px-4 focus:bg-accent data-[state=open]:bg-accent ${className}`}
    >
      {Icon && (
        <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
      )}
      <span className="flex-1 text-sm">{children}</span>
    </MenubarSubTrigger>
  );
}

export interface SelectSubMenuContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  alignOffset?: number;
}

/** Conteneur de la liste des choix */
export function SelectSubMenuContent({
  children,
  className = "min-w-45",
  sideOffset = 12,
  alignOffset = -4,
}: SelectSubMenuContentProps) {
  return (
    <MenubarSubContent
      className={className}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
    >
      {children}
    </MenubarSubContent>
  );
}

export interface SelectSubMenuItemProps<T extends string> {
  value: T;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

/** Option individuelle avec gestion automatique du Check mark */
export function SelectSubMenuItem<T extends string>({
  value,
  icon: Icon,
  children,
  className = "",
}: SelectSubMenuItemProps<T>) {
  const { selectedValue, onValueChange } = useSelectSubMenu();
  const isSelected = selectedValue === value;

  return (
    <MenubarItem
      className={`flex items-center gap-2 cursor-pointer py-1.5 px-3 ${className}`}
      onSelect={(e) => {
        e.preventDefault();
        onValueChange(value);
      }}
    >
      {Icon && <Icon className="size-4 opacity-70" />}
      <span className="flex-1 text-sm">{children}</span>
      {isSelected && (
        <Check className="size-4 text-primary animate-in zoom-in-50 duration-200" />
      )}
    </MenubarItem>
  );
}
