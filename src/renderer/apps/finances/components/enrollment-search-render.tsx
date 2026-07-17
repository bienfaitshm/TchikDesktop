import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, CalendarDays, User, BookOpen } from "lucide-react";
import type { EnrollmentTDO } from "@/packages/@core/data-access/db";

// Mapping de statut vers libellé et variante de couleur
const statusConfig: Record<
  any,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  ACTIVE: { label: "Actif", variant: "default" },
  INACTIVE: { label: "Inactif", variant: "secondary" },
  GRADUATED: { label: "Diplômé", variant: "outline" },
};

interface EnrollmentOverviewProps {
  enrollment: EnrollmentTDO;
}

export function EnrollmentOverview({ enrollment }: EnrollmentOverviewProps) {
  const { student, classroom } = enrollment;

  // Génération des initiales de manière sécurisée
  const initials = (student.fullName ?? "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. En-tête : Identité immédiate */}
      <div className="flex items-center gap-3">
        <Avatar className="size-12 border border-border/50">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-base text-foreground truncate">
              {student.fullName}
            </h4>
            <Badge
              variant={statusConfig[enrollment.status]?.variant ?? "outline"}
              className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider shrink-0"
            >
              {statusConfig[enrollment.status]?.label ?? enrollment.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Code : {enrollment.studentCode}
          </p>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* 2. Informations contextuelles clés (Grille compacte) */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        <InfoItem
          icon={BookOpen}
          label="Classe"
          value={classroom.shortIdentifier || classroom.identifier}
        />
        <InfoItem
          icon={GraduationCap}
          label="Section"
          value={classroom.section}
        />
        <InfoItem
          icon={User}
          label="Genre"
          value={student.gender === "M" ? "Masculin" : "Féminin"}
        />
        <InfoItem
          icon={CalendarDays}
          label="Année"
          value={enrollment.yearName}
        />
      </div>
    </div>
  );
}

// Sous-composant utilitaire repensé pour un affichage dense
function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-0.5 overflow-hidden">
      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
        <Icon className="size-3.5 opacity-70" />
        {label}
      </span>
      <span
        className="text-sm font-medium text-foreground truncate"
        title={value}
      >
        {value || "—"}
      </span>
    </div>
  );
}
