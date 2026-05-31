"use client";
import { Check, Sun, Moon, Laptop, type LucideIcon } from "lucide-react";
import { useTheme, Theme } from "@/renderer/providers/theme";
import {
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarItem,
} from "@/renderer/components/ui/menubar";

const THEME_OPTIONS: Record<Theme, { label: string; icon: LucideIcon }> = {
  light: { label: "Clair", icon: Sun },
  dark: { label: "Sombre", icon: Moon },
  system: { label: "Système", icon: Laptop },
};

export const ThemeMenuItem = () => {
  const { setTheme, theme: currentTheme } = useTheme();

  const activeConfig = THEME_OPTIONS[currentTheme] || THEME_OPTIONS.system;
  const ActiveIcon = activeConfig.icon;

  return (
    <MenubarSub>
      <MenubarSubTrigger className="flex items-center gap-3 cursor-pointer py-2 px-4 focus:bg-accent data-[state=open]:bg-accent">
        <ActiveIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="flex-1 text-sm">Thème</span>
      </MenubarSubTrigger>
      <MenubarSubContent
        className="min-w-[180px]"
        sideOffset={12}
        alignOffset={-4}
      >
        {(Object.entries(THEME_OPTIONS) as [Theme, typeof activeConfig][]).map(
          ([value, { label, icon: ItemIcon }]) => {
            const isSelected = currentTheme === value;

            return (
              <MenubarItem
                key={value}
                className="flex items-center gap-2 cursor-pointer py-1.5 px-3"
                onSelect={(e) => {
                  e.preventDefault();
                  setTheme(value);
                }}
              >
                <ItemIcon className="size-4 opacity-70" />
                <span className="flex-1 text-sm">{label}</span>
                {isSelected && (
                  <Check className="size-4 text-primary animate-in zoom-in-50 duration-200" />
                )}
              </MenubarItem>
            );
          },
        )}
      </MenubarSubContent>
    </MenubarSub>
  );
};
