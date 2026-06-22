import { Users, UserCheck, UserMinus, Activity } from "lucide-react";
import { Card, CardContent } from "@/renderer/components/ui/card";
import { cn } from "@/renderer/utils";
import { useMemo } from "react";

interface KPICardsProps {
  totalStudents?: number;
  activeCount?: number;
  excludedCount?: number;
  dropoutCount?: number;
  newCount?: number;
  oldCount?: number;
}

export const KPICards = ({
  totalStudents = 0,
  activeCount = 0,
  excludedCount = 0,
  dropoutCount = 0,
  newCount = 0,
  oldCount = 0,
}: KPICardsProps) => {
  const retentionRate = useMemo(() => {
    if (totalStudents === 0) return "0%";
    return `${((oldCount / totalStudents) * 100).toFixed(1)}%`;
  }, [oldCount, totalStudents]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={<Users className="size-5" />}
        title="Effectif total"
        value={totalStudents}
        trend="Année en cours"
        trendColor="text-emerald-500"
        iconBg="bg-primary/10 text-primary"
      />
      <KpiCard
        icon={<UserCheck className="size-5" />}
        title="Élèves actifs"
        value={activeCount}
        trend="En règle"
        trendColor="text-emerald-500"
        iconBg="bg-emerald-500/10 text-emerald-500"
      />
      <KpiCard
        icon={<UserMinus className="size-5" />}
        title="Exclusions & Abandons"
        value={excludedCount + dropoutCount}
        trend={
          <>
            <span className="font-medium">Exclus :</span> {excludedCount}
            <span className="mx-1">•</span>
            <span className="font-medium">Abandons :</span> {dropoutCount}
          </>
        }
        trendColor="text-rose-500"
        iconBg="bg-rose-500/10 text-rose-500"
      />
      <KpiCard
        icon={<Activity className="size-5" />}
        title="Taux de rétention"
        value={retentionRate}
        trend={
          <>
            <span className="font-medium">Nouveaux :</span> {newCount}
            <span className="mx-1">•</span>
            <span className="font-medium">Anciens :</span> {oldCount}
          </>
        }
        trendColor="text-sky-500"
        iconBg="bg-sky-500/10 text-sky-500"
      />
    </div>
  );
};

const KpiCard = ({
  icon,
  title,
  value,
  trend,
  trendColor,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  trend: React.ReactNode;
  trendColor: string;
  iconBg: string;
}) => (
  <Card className="border-border/60 bg-card/40 backdrop-blur-xs relative overflow-hidden shadow-xs hover:border-primary/20 transition-all">
    <CardContent className="p-5 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </p>
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        <div
          className={cn("text-[11px] flex items-center gap-1 pt-1", trendColor)}
        >
          {trend}
        </div>
      </div>
      <div className={cn("p-3 rounded-xl border", iconBg)}>{icon}</div>
    </CardContent>
  </Card>
);
