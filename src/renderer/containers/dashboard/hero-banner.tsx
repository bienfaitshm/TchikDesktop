"use client";

import { Badge } from "@/renderer/components/ui/badge";
import { useConfigStore } from "@/renderer/libs/stores/app-store";
import { CalendarDays, Building2 } from "lucide-react";
import React, { useState, useEffect, memo } from "react";

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
 * ⚡ OPTIMISATION 1 : Utilisation de React.memo pour SessionBadge.
 * Ce composant gère sa propre horloge interne. Grâce à memo, ses re-renders
 * fréquents (toutes les secondes) n'impacteront JAMAIS le composant parent (HeroBanner).
 */
export const SessionBadge = memo(() => {
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
});

SessionBadge.displayName = "SessionBadge";

interface HeroBannerProps {}

export const HeroBanner: React.FC<HeroBannerProps> = () => {
  /**
   * ⚡ OPTIMISATION 2 : Ciblage précis de la valeur dans le store.
   * Nous ne récupérons QUE le nom de l'école. Le composant re-rend uniquement si le nom change,
   * ignorant les autres changements d'états internes ou les flags de synchronisation du store.
   */
  const schoolName = useConfigStore((state) => state.currentSchool?.name);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-linear-to-r from-primary/10 via-muted/30 to-background p-6 sm:p-8 shadow-xs">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none hidden md:block">
        <Building2 className="size-36 text-primary" />
      </div>
      <div className="relative z-10 space-y-4">
        {/* L'horloge s'exécute de manière isolée ici */}
        <SessionBadge />
        <div className="space-y-1">
          {/* Un fallback visuel élégant pour éviter tout décalage de mise en page (Layout Shift) */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight min-h-9">
            {schoolName || "Chargement de l'établissement..."}
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
