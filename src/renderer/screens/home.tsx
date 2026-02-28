"use client"

import React from "react";
import {
  Plus,
  Search,
  Users,
  UserMinus,
  UserCheck,
  GraduationCap
} from "lucide-react";

import { TypographyH2, TypographyP } from "@/renderer/components/ui/typography";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/renderer/components/ui/card";

import { ChartPie } from "../components/charts/pie";
import { BarChart } from "../components/charts/bars";
import { withSchoolConfig } from "../hooks/with-application-config";
import { useDashboardStatistics } from "../libs/queries/stats";
import { WithSchoolAndYearId } from "@/commons/types/services";

// --- CONFIGURATIONS DES GRAPHIQUES ---

const GENDER_CONFIG = {
  value: { label: "Élèves" },
  masculin: { label: "Garçons", color: "hsl(var(--chart-1))" },
  féminin: { label: "Filles", color: "hsl(var(--chart-2))" },
};

const STATUS_CONFIG = {
  value: { label: "Total" },
  active: { label: "Actifs", color: "hsl(var(--chart-1))" },
  exclu: { label: "Exclus", color: "hsl(var(--destructive))" },
  abandon: { label: "Abandons", color: "hsl(var(--muted))" },
};

const OPTION_CONFIG = {
  value: { label: "Élèves", color: "hsl(var(--chart-2))" },
};

const RETENTION_CONFIG = {
  value: { label: "Élèves" },
  anciens: { label: "Anciens", color: "hsl(var(--chart-1))" },
  nouveaux: { label: "Nouveaux", color: "hsl(var(--chart-5))" },
};

const Home: React.FC<WithSchoolAndYearId> = (props) => {
  const {
    genderDistribution,
    statusDistribution,
    studentsByClass,
    retentionData,
    studentsByOption,
    summary
  } = useDashboardStatistics(props);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">

      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <TypographyH2>Tableau de bord</TypographyH2>
          <TypographyP className="text-muted-foreground">
            Analyse et gestion des effectifs pour l'année scolaire en cours.
          </TypographyP>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Chercher un élève..." className="pl-8" />
          </div>
          <Button className="shrink-0 shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Inscription
          </Button>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Étudiants"
          value={summary?.total ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Inscrits au total"
        />
        <KpiCard
          title="Élèves Actifs"
          value={summary?.active ?? 0}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
          description="En règle de dossier"
        />
        <KpiCard
          title="Exclusions"
          value={summary?.excluded ?? 0}
          icon={<UserMinus className="h-4 w-4 text-destructive" />}
          description="Depuis le début d'année"
        />
        <KpiCard
          title="Taux de Rétention"
          value="92%"
          icon={<GraduationCap className="h-4 w-4 text-blue-500" />}
          description="Élèves ré-inscrits"
        />
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Effectifs par Classe (Principal) */}
        <Card className="lg:col-span-12 shadow-sm">
          <CardHeader>
            <CardTitle>Effectifs par Niveau</CardTitle>
            <CardDescription>Nombre d'élèves par classe physique</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={studentsByClass}
              xAxisKey="shortName"
              bars={["value"]}
              config={{ value: { label: "Élèves", color: "hsl(var(--chart-1))" } }}
            />
          </CardContent>
        </Card>

        {/* Rétention (Anciens vs Nouveaux) */}
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Rétention</CardTitle>
            <CardDescription>Fidélité des effectifs</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPie
              data={retentionData}
              config={RETENTION_CONFIG}
              centerDataInfos={{
                total: summary?.total ?? 0,
                totalLabel: "Total"
              }}
            />
          </CardContent>
        </Card>

        {/* Inscriptions par Options (Filières) */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader>
            <CardTitle>Popularité des Options</CardTitle>
            <CardDescription>Répartition par filière d'étude</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={studentsByOption}
              xAxisKey="label"
              bars={["value"]}
              config={OPTION_CONFIG}
              labelFormatter={(v) => v.length > 10 ? v.substring(0, 10) + "..." : v}
            />
          </CardContent>
        </Card>

        {/* Statut Global */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Discipline</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPie
              data={statusDistribution}
              config={STATUS_CONFIG}
            />
          </CardContent>
        </Card>

        {/* Genre */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Démographie</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPie
              data={genderDistribution}
              config={GENDER_CONFIG}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, description }: any) => (
  <Card className="overflow-hidden border-l-4 border-l-primary/10 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="rounded-full bg-muted p-2">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

export const HomePage = withSchoolConfig(Home);