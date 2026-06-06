"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/renderer/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { cn } from "@/renderer/utils";

interface InteractivePieProps<T> {
  data: T[];
  config: ChartConfig;
  dataKey: keyof T & string;
  nameKey: keyof T & string;
  height?: number;
  id?: string;
  className?: string;
}

export function InteractivePieChart<T extends Record<string, any>>({
  data,
  config,
  dataKey,
  nameKey,
  height = 250,
  id = "interactive-pie",
  className,
}: InteractivePieProps<T>) {
  const [activeKey, setActiveKey] = React.useState<string>(() =>
    String(data[0]?.[nameKey] ?? ""),
  );

  if (!data.length) return null;

  const chartData = React.useMemo(() => {
    return data.map((item) => {
      const slug = item.label.toLowerCase().replace(/\s+/g, "-");
      return { ...item, fill: item.fill || `var(--color-${slug})` };
    });
  }, [data]);

  const activeIndex = data.findIndex(
    (item) => String(item[nameKey]) === activeKey,
  );
  const activeItem = data[activeIndex];
  const activeLabel = config[activeKey]?.label ?? activeKey;

  return (
    <div
      data-chart={id}
      style={{ height }}
      className={cn("flex flex-col gap-2", className)}
    >
      <Select value={activeKey} onValueChange={setActiveKey}>
        <SelectTrigger className="ml-auto h-7 w-(130px) rounded-lg pl-2.5 text-xs">
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent align="end" className="rounded-xl">
          {data.map((item) => {
            const key = String(item[nameKey]);
            return (
              <SelectItem key={key} value={key} className="rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: config[key]?.color }}
                  />
                  {config[key]?.label ?? key}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <ChartContainer id={id} config={config} className="h-full aspect-square">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey={dataKey}
            nameKey={nameKey}
            strokeWidth={1}
            innerRadius={50}
            outerRadius={70}
            stroke="var(--background)"
            shape={(props: any) => {
              const { outerRadius = 0, index, ...rest } = props;
              if (index === activeIndex) {
                return (
                  <g>
                    <Sector {...rest} outerRadius={outerRadius + 10} />
                    <Sector
                      {...rest}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                );
              }
              return <Sector {...props} />;
            }}
          >
            <Label
              content={(props) => {
                const viewBox = props.viewBox as
                  | { cx?: number; cy?: number }
                  | undefined;
                if (!viewBox?.cx || !viewBox?.cy) return null;

                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {activeItem?.[dataKey]?.toLocaleString() ?? "0"}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy + 20}
                      className="fill-muted-foreground text-[10px] uppercase font-medium"
                    >
                      {activeLabel}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
