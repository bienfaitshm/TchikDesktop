"use client";
import * as React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Wand2 } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/renderer/components/ui/empty";

interface EmptySeatingMessageProps extends React.PropsWithChildren {
  sessionName?: string;
}

export const EmptySeatingMessage: React.FC<EmptySeatingMessageProps> = ({
  children,
  sessionName,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full mt-5">
      <header className="flex flex-row items-center gap-4 sm:gap-6">
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0 rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-5" />
          <span className="sr-only">Retour</span>
        </Button>

        <div className="space-y-1">
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
            {sessionName}
          </h1>
          <p className="text-sm text-muted-foreground leading-none">
            Configuration du plan de salle et répartition des candidats.
          </p>
        </div>
      </header>

      <Empty className="min-h-[65vh] border-2 border-dashed rounded-4xl bg-muted/5 transition-colors hover:bg-muted/10 mt-4 flex flex-col items-center justify-center">
        <EmptyHeader className="flex flex-col items-center text-center">
          <EmptyMedia variant="icon" className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl animate-pulse" />
            <div className="relative bg-background border shadow-xs p-6 rounded-3xl">
              <Wand2 className="size-12 text-primary" />
            </div>
          </EmptyMedia>

          <EmptyTitle className="text-2xl font-semibold tracking-tight">
            Plan de salle vide
          </EmptyTitle>

          <EmptyDescription className="max-w-sm text-center mt-3 leading-relaxed text-muted-foreground">
            Organisez vos candidats en quelques clics. Utilisez le générateur
            pour assigner automatiquement les places.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="mt-10 flex flex-col items-center gap-4">
          {children}
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Action requise pour continuer
          </p>
        </EmptyContent>
      </Empty>
    </div>
  );
};
