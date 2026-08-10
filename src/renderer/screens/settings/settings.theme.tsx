import { useTheme, Theme } from "@/renderer/providers/theme";
import { ButtonGroup } from "@/renderer/components/ui/button-group";
import { Button } from "@/renderer/components/ui/button";
import { Sun, Moon, Laptop } from "lucide-react";

interface ThemeOption {
  label: string;
  value: Theme;
  icon: React.ComponentType<{ className?: string }>;
}

const THEME_OPTIONS: ThemeOption[] = [
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
  { label: "System", value: "system", icon: Laptop },
];

/**
 * Renders an accessible button group control for switching application theme.
 * @returns The rendered theme toggle selector component.
 */
export const ThemeButton = () => {
  const { theme, setTheme } = useTheme();

  return (
    <ButtonGroup role="group" aria-label="Theme selector">
      {THEME_OPTIONS.map(({ label, value, icon: Icon }) => {
        const isActive = theme === value;

        return (
          <Button
            key={value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            className="gap-1.5"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        );
      })}
    </ButtonGroup>
  );
};
