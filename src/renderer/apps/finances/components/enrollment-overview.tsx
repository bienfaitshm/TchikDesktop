"use client";
import React from "react";
import { ArrowRight, BookOpen, GraduationCap, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/renderer/utils";
import {
  getSectionLabel,
  SECTION_ENUM,
} from "@/packages/@core/data-access/db/options";

export enum STUDENT_STATUS_ENUM {
  ACTIVE = "ACTIVE",
  DROPOUT = "DROPOUT",
  EXPELLED = "EXPELLED",
  GRADUATED = "GRADUATED",
}

// Configuration des statuts inspirée par l'esthétique de profile.png
// Utilisation de variantes sémantiques de Badge quand possible.
const statusConfig: Record<
  STUDENT_STATUS_ENUM,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    dotColor?: string;
  }
> = {
  [STUDENT_STATUS_ENUM.ACTIVE]: {
    label: "Actif",
    variant: "secondary", // Proche du fond clair de "Available"
    dotColor: "bg-emerald-500", // Le point vert sur l'avatar
  },
  [STUDENT_STATUS_ENUM.DROPOUT]: {
    label: "Abandon",
    variant: "outline",
  },
  [STUDENT_STATUS_ENUM.EXPELLED]: {
    label: "Exclu",
    variant: "destructive",
  },
  [STUDENT_STATUS_ENUM.GRADUATED]: {
    label: "Diplômé",
    variant: "default", // Vert foncé / Noir par défaut
  },
};

// Mocks des types TDO pour le snippet
interface StudentTDO {
  fullName: string;
  gender: "M" | "F";
}
interface ClassroomTDO {
  identifier: string;
  shortIdentifier?: string;
  section: SECTION_ENUM;
}
interface EnrollmentTDO {
  id: string;
  student: StudentTDO;
  classroom: ClassroomTDO;
  status: STUDENT_STATUS_ENUM;
  studentCode: string;
  yearName: string;
}

interface EnrollmentOverviewProps {
  enrollment: EnrollmentTDO;
}

// --- Composant Principal ---

export function EnrollmentOverview({ enrollment }: EnrollmentOverviewProps) {
  const { student, classroom } = enrollment;
  const config = statusConfig[enrollment.status] || {
    label: enrollment.status,
    variant: "outline",
  };

  // Génération des initiales sécurisée
  const initials = (student.fullName ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    // 1. Structure Globale : Utilisation de Card pour le conteneur
    <div className="my-5">
      <div className="p-0 flex flex-col gap-6">
        {/* 2. En-tête : Identité et Statut (Inspiration top part de profile.png) */}
        <div className="flex items-center gap-4 px-6">
          <div className="relative shrink-0">
            {/* Avatar avec bordure subtile */}
            <Avatar className="size-24 border border-border/40">
              <AvatarFallback className="bg-primary/5 text-primary font-semibold text-xl tracking-tight">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Point d'indicateur de statut sur l'avatar (comme profile.png) */}
            {config.dotColor && (
              <span
                className={cn(
                  "absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-background",
                  config.dotColor,
                )}
              />
            )}
          </div>

          <div className="flex flex-col flex-1 gap-1.5 overflow-hidden">
            {/* Badge de statut style "Available" */}
            <Badge
              variant={config.variant}
              className="w-fit px-2 py-0.5 text-[11px] font-medium tracking-normal rounded-full"
            >
              {config.label}
              {/* Flèche d'action subtile si Actif, imitant "Available >" */}
              {enrollment.status === STUDENT_STATUS_ENUM.ACTIVE && (
                <ArrowRight className="size-3 ml-1 opacity-60" />
              )}
            </Badge>

            {/* Nom : Grand et Gras (Liam Basil style) */}
            <h2
              className="text-base font-bold tracking-tighter text-foreground truncate"
              title={student.fullName}
            >
              {student.fullName}
            </h2>
            {/* Description : Plus petite (Product designer style) */}
            <p className="text-xs text-muted-foreground font-mono truncate">
              Code : {enrollment.studentCode}
            </p>
          </div>
        </div>

        {/* 3. Section Statistiques/Détails (Inspiration du bloc encadré de profile.png) */}
        <div className="grid grid-cols-3">
          <StatItem
            icon={BookOpen}
            label="Classe"
            value={classroom.shortIdentifier || classroom.identifier}
          />
          <StatItem
            icon={GraduationCap}
            label="Section"
            value={getSectionLabel(classroom.section)}
          />
          <StatItem
            icon={User}
            label="Genre"
            value={student.gender === "M" ? "Masculin" : "Féminin"}
          />
        </div>
      </div>
    </div>
  );
}

// --- Sous-composant utilitaire : StatItem ---
// Repensé pour l'affichage horizontal type "Stats" de profile.png

interface StatItemProps {
  label: string;
  value: string | null | undefined;
  icon: React.ElementType;
}

function StatItem({ label, value, icon: Icon }: StatItemProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-3 text-center overflow-hidden">
      {/* Valeur : Grande, Noire, En haut (Comme "$0", "5.00") */}
      <span
        className="text-xs text-foreground truncate w-full"
        title={value ?? "—"}
      >
        {value || "—"}
      </span>
      {/* Label : Petit, Muted, En bas (Comme "Earned", "Rating") */}
      <span className="text-[11px] font-medium text-muted-foreground/90 flex items-center gap-1.5 uppercase tracking-wider">
        <Icon className="size-3 opacity-60 shrink-0" />
        {label}
      </span>
    </div>
  );
}
