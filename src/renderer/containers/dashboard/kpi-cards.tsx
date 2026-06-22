import {
  Users,
  UserCheck,
  UserMinus,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/renderer/components/ui/card";

interface KPICardsProps {
  totalStudents: number;
  activeCount: number;
  excludedCount: number;
}

export const KPICards = ({
  totalStudents,
  activeCount,
  excludedCount,
}: KPICardsProps) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      icon={<Users className="size-5" />}
      title="Effectif Total"
      value={totalStudents}
      trend="+12% ce trimestre"
      trendColor="text-emerald-500"
      iconBg="bg-primary/10 text-primary"
    />
    <KpiCard
      icon={<UserCheck className="size-5" />}
      title="Dossiers Réguliers"
      value={activeCount}
      trend="En règle pour les examens"
      trendColor="text-emerald-500"
      iconBg="bg-emerald-500/10 text-emerald-500"
    />
    <KpiCard
      icon={<UserMinus className="size-5" />}
      title="Exclusions / Départs"
      value={excludedCount}
      trend="Mutations ou non-paiement"
      trendColor="text-rose-500"
      iconBg="bg-rose-500/10 text-rose-500"
    />
    <KpiCard
      icon={<Activity className="size-5" />}
      title="Taux de Rétention"
      value="94.2%"
      trend="Fidélisation des promotions"
      trendColor="text-sky-500"
      iconBg="bg-sky-500/10 text-sky-500"
    />
  </div>
);

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
  trend: string;
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
        <p className={`text-[11px] flex items-center gap-1 pt-1 ${trendColor}`}>
          <TrendingUp className="size-3" /> {trend}
        </p>
      </div>
      <div className={`p-3 rounded-xl border ${iconBg}`}>{icon}</div>
    </CardContent>
  </Card>
);
