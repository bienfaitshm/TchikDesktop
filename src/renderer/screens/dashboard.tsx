"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Users,
  UserMinus,
  UserCheck,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

import { TypographyH2, TypographyP } from "@/renderer/components/ui/typography";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Badge } from "@/renderer/components/ui/badge";
import { Separator } from "@/renderer/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { Skeleton } from "@/renderer/components/ui/skeleton";

// Custom chart components (supposés suivre le pattern ChartContainer + Recharts)
import { ChartPie } from "../components/charts/pie";
import { BarChart } from "../components/charts/bars";
import { useDashboardStatistics } from "../libs/queries/stats";
import { useSchoolContext } from "../hooks/app-config-router";
import type { ChartConfig } from "@/renderer/components/ui/chart";

// --- CONFIGURATIONS DES GRAPHIQUES (couleurs en variables CSS) ---
const GENDER_CONFIG = {
  value: { label: "Élèves" },
  masculin: { label: "Garçons", color: "hsl(var(--chart-1))" },
  féminin: { label: "Filles", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const STATUS_CONFIG = {
  value: { label: "Total" },
  active: { label: "Actifs", color: "hsl(var(--chart-1))" },
  exclu: { label: "Exclus", color: "hsl(var(--chart-danger))" },
  abandon: { label: "Abandons", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const OPTION_CONFIG = {
  value: { label: "Élèves", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const CLASS_CONFIG = {
  value: { label: "Élèves", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const RETENTION_CONFIG = {
  value: { label: "Élèves" },
  anciens: { label: "Anciens", color: "hsl(var(--chart-1))" },
  nouveaux: { label: "Nouveaux", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

// --- SOUS-COMPOSANTS PROFESSIONNELS ---

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const KpiCard = ({
  title,
  value,
  icon,
  description,
  trend,
  onClick,
}: KpiCardProps) => (
  <Card
    className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    onClick={onClick}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="rounded-lg bg-muted p-2 group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {trend && (
          <Badge
            variant="outline"
            className={`text-xs font-medium ${
              trend.isPositive
                ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                : "text-red-600 border-red-200 bg-red-50"
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3" />
            )}
            {trend.value}%
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const ChartCard = ({
  title,
  description,
  children,
  className,
  action,
}: ChartCardProps) => (
  <Card
    className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </CardHeader>
    <CardContent className="pt-4">{children}</CardContent>
  </Card>
);

// --- COMPOSANT PRINCIPAL ---

export const DashBoardPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [timeRange, setTimeRange] = React.useState("this-year");
  const [activeTab, setActiveTab] = React.useState("overview");

  const {
    genderDistribution,
    statusDistribution,
    studentsByClass,
    retentionData,
    studentsByOption,
    summary,
  } = useDashboardStatistics({ schoolId, yearId });

  // Tendances simulées (à remplacer par de vraies données)
  const trends = {
    total: { value: 12, isPositive: true },
    active: { value: 8, isPositive: true },
    excluded: { value: 3, isPositive: false },
    retention: { value: 5, isPositive: true },
  };

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* 1. HEADER AVEC ACTIONS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <TypographyH2 className="text-2xl font-bold tracking-tight">
            Tableau de bord
          </TypographyH2>
          <TypographyP className="text-muted-foreground">
            Analyse et gestion des effectifs pour l&apos;année scolaire en
            cours.
          </TypographyP>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Chercher un élève..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-9 w-[140px] gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-year">Cette année</SelectItem>
              <SelectItem value="last-year">Année passée</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
          <Button className="h-9 shadow-sm gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle Inscription</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI CARDS AVEC TENDANCES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Étudiants"
          value={summary?.total ?? 0}
          icon={<Users className="h-4 w-4 text-primary" />}
          description="Inscrits au total"
          trend={trends.total}
        />
        <KpiCard
          title="Élèves Actifs"
          value={summary?.active ?? 0}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
          description="En règle de dossier"
          trend={trends.active}
        />
        <KpiCard
          title="Exclusions"
          value={summary?.excluded ?? 0}
          icon={<UserMinus className="h-4 w-4 text-destructive" />}
          description="Depuis le début d'année"
          trend={trends.excluded}
        />
        <KpiCard
          title="Taux de Rétention"
          value="92%"
          icon={
            <GraduationCap
              className="h-4 w-4"
              style={{ color: "hsl(var(--chart-5))" }}
            />
          }
          description="Élèves ré-inscrits"
          trend={trends.retention}
        />
      </div>

      {/* 3. ONGLETS POUR ORGANISER LE CONTENU */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="details">Détails par classe</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Effectifs par Classe (Principal) */}
          <ChartCard
            title="Effectifs par Niveau"
            description="Nombre d'élèves par classe physique"
            className="lg:col-span-12"
          >
            <BarChart
              data={studentsByClass}
              xAxisKey="shortName"
              bars={["value"]}
              config={CLASS_CONFIG}
              height={300}
            />
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Rétention (Anciens vs Nouveaux) */}
            <ChartCard
              title="Rétention"
              description="Fidélité des effectifs"
              className="lg:col-span-4"
            >
              <ChartPie
                data={retentionData}
                config={RETENTION_CONFIG}
                centerDataInfos={{
                  total: summary?.total ?? 0,
                  totalLabel: "Total",
                }}
                height={220}
              />
            </ChartCard>

            {/* Popularité des Options */}
            <ChartCard
              title="Popularité des Options"
              description="Répartition par filière d'étude"
              className="lg:col-span-5"
            >
              <BarChart
                data={studentsByOption}
                xAxisKey="label"
                bars={["value"]}
                config={OPTION_CONFIG}
                labelFormatter={(v: string) =>
                  v.length > 12 ? v.substring(0, 10) + "..." : v
                }
                height={220}
              />
            </ChartCard>

            {/* Statut Global */}
            <ChartCard title="Discipline" className="lg:col-span-3">
              <ChartPie
                data={statusDistribution}
                config={STATUS_CONFIG}
                height={220}
              />
            </ChartCard>
          </div>

          {/* Démographie seule ou intégrée */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <ChartCard
              title="Démographie"
              description="Répartition par genre"
              className="lg:col-span-3"
            >
              <ChartPie
                data={genderDistribution}
                config={GENDER_CONFIG}
                height={220}
              />
            </ChartCard>

            {/* Carte vide pour équilibrer la grille, ou une autre stat */}
            <Card className="lg:col-span-9 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Répartition géographique (placeholder)
                </CardTitle>
                <CardDescription>
                  Carte ou graphique supplémentaire
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                Données cartographiques à intégrer
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <ChartCard
            title="Détail par classe"
            description="Effectifs détaillés avec options de filtrage"
            className="lg:col-span-12"
          >
            <BarChart
              data={studentsByClass}
              xAxisKey="shortName"
              bars={["value"]}
              config={CLASS_CONFIG}
              height={400}
            />
          </ChartCard>
          {/* Possibilité d'ajouter un tableau détaillé ici */}
        </TabsContent>
      </Tabs>
    </div>
  );
};
