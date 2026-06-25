const THEMES = { light: "", dark: ".dark" } as const;
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;
export const CLASS_CONFIG = {
  value: { label: "Élèves", color: "var(--color-primary)" },
} satisfies ChartConfig;
export const OPTION_CONFIG = {
  value: { label: "Élèves", color: "var(--chart-1)" },
} satisfies ChartConfig;
export const GENDER_CONFIG = {
  M: { label: "Garçons", color: "var(--chart-1)" },
  F: { label: "Filles", color: "var(--chart-3)" },
} satisfies ChartConfig;
export const STATUS_CONFIG = {
  active: { label: "Actifs", color: "var(--color-primary)" },
  exclu: { label: "Exclus", color: "var(--color-destructive)" },
  abandon: { label: "Abandons", color: "var(--color-secondary)" },
} satisfies ChartConfig;

export const enrollmentChartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
  female: {
    label: "Filles",
    color: "var(--chart-2)",
  },
  male: {
    label: "Garçons",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;
