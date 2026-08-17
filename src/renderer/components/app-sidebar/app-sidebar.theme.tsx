"use client";
import { Sun, Moon, Laptop, type LucideIcon } from "lucide-react";
import { useTheme, Theme } from "@/renderer/providers/theme";

import {
  SelectSubMenu,
  SelectSubMenuContent,
  SelectSubMenuItem,
  SelectSubMenuTrigger,
} from "./submenu-select";

const THEME_ICONS: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Laptop,
};

export const ThemeMenuItem = () => {
  const { setTheme, theme } = useTheme();
  const ActiveIcon = THEME_ICONS[theme] || Laptop;

  return (
    <SelectSubMenu value={theme} onValueChange={setTheme}>
      <SelectSubMenuTrigger icon={ActiveIcon}>Thème</SelectSubMenuTrigger>
      <SelectSubMenuContent>
        <SelectSubMenuItem value="light" icon={Sun}>
          Clair
        </SelectSubMenuItem>
        <SelectSubMenuItem value="dark" icon={Moon}>
          Sombre
        </SelectSubMenuItem>
        <SelectSubMenuItem value="system" icon={Laptop}>
          Système
        </SelectSubMenuItem>
      </SelectSubMenuContent>
    </SelectSubMenu>
  );
};
