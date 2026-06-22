"use client";

import { BarChart } from "@/renderer/components/charts/bars";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/renderer/components/ui/card";
import { Layers } from "lucide-react";
import { CLASS_CONFIG } from "@/renderer/constants/charts";
import type { ClassStatsDTO } from "@/packages/@core/data-access/db/queries";

interface PromotionVolumeSectionProps {
  data: ClassStatsDTO[];
}

export const PromotionVolumeSection = ({
  data,
}: PromotionVolumeSectionProps) => (
  <Card className="border-border/60 bg-card/40 backdrop-blur-xs shadow-xs lg:col-span-8 flex flex-col justify-between overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/10 py-4 px-6">
      <div className="space-y-0.5">
        <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
          <Layers className="size-4 text-primary" /> Volume de Scolarisation par
          Promotion
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Effectifs cumulés répartis par niveau d'étude
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      <BarChart
        data={data}
        xAxisKey="shortName"
        bars={["value"]}
        config={CLASS_CONFIG}
        height={260}
      />
      <PromotionTable data={data} />
    </CardContent>
  </Card>
);

const PromotionTable = ({ data }: { data: ClassStatsDTO[] }) => (
  <div className="overflow-x-auto rounded-lg border border-border/40">
    <table className="w-full text-xs">
      <thead className="bg-muted/30">
        <tr className="border-b border-border/40">
          <th className="text-left p-3 font-semibold text-muted-foreground">
            Promotion
          </th>
          <th className="text-right p-3 font-semibold text-muted-foreground">
            Effectif
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/20">
        {data.map((item) => (
          <tr
            key={item.shortName}
            className="hover:bg-muted/10 transition-colors"
          >
            <td className="p-3 font-medium">{item.label}</td>
            <td className="p-3 text-right font-mono font-bold">{item.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
