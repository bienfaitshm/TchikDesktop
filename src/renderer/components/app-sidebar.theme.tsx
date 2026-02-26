import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import {
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/renderer/components/ui/sidebar";
import { Check, Sun, Moon, Laptop, ChevronsUpDown } from "lucide-react";
import { useTheme, Theme } from "@/renderer/providers/theme";


const MODES: { label: string; value: Theme }[] = [
    { label: "Clair", value: "light" },
    { label: "Sombre", value: "dark" },
    { label: "Système", value: "system" },
];

export const ThemeMenuItem = () => {
    const { setTheme, theme: currentTheme } = useTheme();
    const { isMobile } = useSidebar();

    const CurrentThemeIcon = React.useMemo(() => {
        switch (currentTheme) {
            case "light":
                return Sun;
            case "dark":
                return Moon;
            case "system":
                return Laptop;
            default:
                return Sun;
        }
    }, [currentTheme]);

    const currentThemeLabel = React.useMemo(() => {
        return MODES.find((mode) => mode.value === currentTheme)?.label || "Thème";
    }, [currentTheme]);

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="sm"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group justify-start"
                    >
                        <div className="flex aspect-square size-6 items-center justify-center rounded-md">
                            <CurrentThemeIcon className="size-4" />
                        </div>
                        <span className="flex-1 text-left text-sm ml-2">
                            {currentThemeLabel}
                        </span>
                        <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] rounded-lg shadow-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="start"
                    sideOffset={8}
                >
                    <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                        Sélectionner le thème
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        {MODES.map((mode) => (
                            <DropdownMenuItem
                                key={mode.value}
                                onSelect={() => setTheme(mode.value)}
                                className="flex items-center justify-between"
                                disabled={mode.value === currentTheme}
                            >
                                {mode.label}
                                {mode.value === currentTheme && (
                                    <Check className="ml-2 size-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};
