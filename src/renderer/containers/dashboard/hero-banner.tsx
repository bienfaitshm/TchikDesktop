"use client";

import { Badge } from "@/renderer/components/ui/badge";
import { useConfigStore } from "@/renderer/libs/stores/app-store";
import { CalendarDays, Building2 } from "lucide-react";
import React, { useState, useEffect } from "react";

function getFormattedDateTime(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Affiche les badges de session active et de date/heure mis à jour périodiquement.
 */
export const SessionBadge = () => {
  const [formattedDate, setFormattedDate] = useState(getFormattedDateTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedDate(getFormattedDateTime());
    }, 1_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant="outline"
        className="bg-background/80 text-primary border-primary/20 backdrop-blur-xs font-medium text-[11px] py-0.5 px-2.5 gap-1"
      >
        Session active
      </Badge>
      <Badge variant="secondary" className="font-mono text-[11px] bg-muted/60">
        <CalendarDays className="size-3 mr-1 opacity-70" /> {formattedDate}
      </Badge>
    </div>
  );
};

interface HeroBannerProps {}

export const HeroBanner: React.FC<HeroBannerProps> = ({}) => {
  const school = useConfigStore((state) => state.currentSchool);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-linear-to-r from-primary/10 via-muted/30 to-background p-6 sm:p-8 shadow-xs">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none hidden md:block">
        <Building2 className="size-36 text-primary" />
      </div>
      <div className="relative z-10 space-y-4">
        <SessionBadge />
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {school?.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Fini le travail manuel <b>Tchik</b> génère et sécurise
            automatiquement vos documents en local. Gagnez du temps,
            concentrez-vous sur l'essentiel.
          </p>
        </div>
      </div>
    </div>
  );
};
