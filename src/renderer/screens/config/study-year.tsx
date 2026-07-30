import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { format, isWithinInterval, isBefore, isAfter } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Plus,
  Search,
  School,
  ChevronRight,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/renderer/components/ui/input-group";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/renderer/components/ui/alert";
import { Skeleton } from "@/renderer/components/ui/skeleton";

import { useGetStudyYears } from "@/renderer/libs/queries/study-years";
import { Suspense as DataSuspense } from "@/renderer/libs/queries/suspense";
import { StudyYearCreationForm } from "./study-year.new-study-year";
import {
  useConfigActions,
  useCurrentConfig,
} from "@/renderer/libs/stores/app-store";
import { ConfigHeader } from "./config.header";

interface StudyYearDataDisplay {
  yearId: string;
  schoolId: string;
  yearName: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Calcule le statut de l'année scolaire par rapport à la date actuelle.
 */
const getStudyYearStatus = (startDate: Date, endDate: Date) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isWithinInterval(now, { start, end })) {
    return { label: "En cours", variant: "default" as const };
  }
  if (isBefore(now, start)) {
    return { label: "À venir", variant: "secondary" as const };
  }
  if (isAfter(now, end)) {
    return { label: "Clôturée", variant: "outline" as const };
  }
  return { label: "Inconnue", variant: "outline" as const };
};

const StudyYearListDisplayTable: React.FC = () => {
  const navigate = useNavigate();
  const { school } = useCurrentConfig();
  const configActions = useConfigActions();
  const [searchQuery, setSearchQuery] = useState("");

  if (!school?.schoolId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto min-h-[300px]">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
          <School className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Aucun établissement sélectionné
        </h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Veuillez choisir un établissement avant de pouvoir gérer ou
          sélectionner ses années scolaires.
        </p>
        <Button asChild>
          <Link to="/configuration">Sélectionner un établissement</Link>
        </Button>
      </div>
    );
  }

  const { data: studyYears = [], isError } = useGetStudyYears();

  const filteredYears = useMemo(() => {
    if (!searchQuery.trim()) return studyYears;
    const query = searchQuery.toLowerCase();
    return studyYears.filter((sy: StudyYearDataDisplay) =>
      sy.yearName.toLowerCase().includes(query),
    );
  }, [studyYears, searchQuery]);

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-6">
        <AlertCircle data-icon="inline-start" />
        <AlertTitle>Erreur de chargement</AlertTitle>
        <AlertDescription>
          Impossible de récupérer la liste des années scolaires pour cet
          établissement. Veuillez réessayer ultérieurement ou contacter le
          support.
        </AlertDescription>
      </Alert>
    );
  }

  if (studyYears.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto min-h-100">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
          <GraduationCap className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Aucune année scolaire
        </h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Aucune année scolaire n'est configurée pour <b>{school.name}</b>.
          Créez-en une pour démarrer la session.
        </p>
        <Card className="w-full text-left">
          <CardContent className="pt-6">
            <StudyYearCreationForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6">
      <ConfigHeader showBackButton title="Sélection de l'année scolaire" />

      {/* Header opérationnel avec recherche et CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Établissement :{" "}
            <strong className="text-foreground font-semibold">
              {school.name}
            </strong>
          </p>
        </div>
        <Button asChild>
          <Link to="/configuration/school-year/new">
            <Plus data-icon="inline-start" />
            Nouvelle année scolaire
          </Link>
        </Button>
      </div>

      {/* Filtre de recherche */}
      {studyYears.length > 1 && (
        <div className="max-w-md">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Rechercher une année (ex: 2024-2025)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>
      )}

      {/* Grille de sélection des années scolaires */}
      {filteredYears.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredYears.map((studyYear) => {
            const status = getStudyYearStatus(
              studyYear.startDate,
              studyYear.endDate,
            );
            return (
              <Card
                key={studyYear.yearId}
                className="group relative cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                onClick={() => {
                  configActions.setCurrentStudyYear(studyYear);
                  navigate("/", { replace: true });
                }}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {studyYear.yearName}
                    </CardTitle>
                    <Badge
                      variant={status.variant}
                      className="w-fit text-xs font-normal"
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Calendar className="size-3.5 shrink-0" />
                    <span>
                      {format(new Date(studyYear.startDate), "d MMM yyyy", {
                        locale: fr,
                      })}
                      {" — "}
                      {format(new Date(studyYear.endDate), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">
            Aucune année scolaire ne correspond à la recherche "{searchQuery}".
          </p>
        </div>
      )}
    </div>
  );
};

export const StudyYearConfigPage: React.FC = () => {
  return (
    <div>
      <DataSuspense fallback={<StudyYearSkeletonGrid />}>
        <StudyYearListDisplayTable />
      </DataSuspense>
    </div>
  );
};

/**
 * Skeleton de chargement imitant la structure des cartes.
 */
const StudyYearSkeletonGrid: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex justify-between items-center gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
};
