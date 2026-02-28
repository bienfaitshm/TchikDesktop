"use client"

import React, { useMemo } from "react";
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

// Configuration des couleurs/labels pour les graphiques
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

const Home: React.FC<WithSchoolAndYearId> = (props) => {
  const {
    genderDistribution,
    statusDistribution,
    studentsByClass,
    summary
  } = useDashboardStatistics(props);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">

      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <TypographyH2>Tableau de bord</TypographyH2>
          <TypographyP className="text-muted-foreground">
            Aperçu global de l'établissement pour l'année scolaire en cours.
          </TypographyP>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un élève..." className="pl-8" />
          </div>
          <Button className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Inscription
          </Button>
        </div>
      </div>

      {/* 2. KPI CARDS (Statistiques rapides) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Étudiants"
          value={summary?.total ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Inscrits cette année"
        />
        <KpiCard
          title="Élèves Actifs"
          value={summary?.active ?? 0}
          icon={<UserCheck className="h-4 w-4 text-primary" />}
          description="En ordre de cours"
        />
        <KpiCard
          title="Exclusions"
          value={summary?.excluded ?? 0}
          icon={<UserMinus className="h-4 w-4 text-destructive" />}
          description="Derniers 30 jours"
        />
        <KpiCard
          title="Taux de Rétention"
          value="94%"
          icon={<GraduationCap className="h-4 w-4 text-blue-500" />}
          description="+2.4% vs l'an dernier"
        />
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Répartition par classe (Grand format) */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Effectifs par Classe</CardTitle>
            <CardDescription>Nombre d'élèves par niveau d'étude</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={studentsByClass}
              xAxisKey="label"
              bars={["value"]}
              config={{ value: { label: "Élèves", color: "hsl(var(--primary))" } }}
            />
          </CardContent>
        </Card>

        {/* Répartition par Statut (Format compact) */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Statut Global</CardTitle>
            <CardDescription>Répartition des inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPie
              data={statusDistribution}
              config={STATUS_CONFIG}
              centerDataInfos={{
                total: summary?.total ?? 0,
                totalLabel: "Élèves"
              }}
            />
          </CardContent>
        </Card>

        {/* Répartition par Genre */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Parité Genre</CardTitle>
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

/**
 * Sous-composant pour les cartes KPI
 */
const KpiCard = ({ title, value, icon, description }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const HomePage = withSchoolConfig(Home);