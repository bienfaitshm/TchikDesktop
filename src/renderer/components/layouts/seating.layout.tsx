"use client";

import * as React from "react";
import { useParams, Outlet } from "react-router";
import { Wand2 } from "lucide-react";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/components/layouts/page-shell.layout";
import { SeatingGeneratorDialog } from "@/renderer/dialog-actions/seating-generator";
import { useGetSeatingSessionById } from "@/renderer/libs/queries/seating";

export const SeatingSessionLayout: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { schoolId, yearId } = useSchoolContext();

  const { data: seatingSession } = useGetSeatingSessionById(sessionId!);

  if (!seatingSession) return null;

  const { hasAssignments, sessionName } = seatingSession;

  return (
    <PageShell
      maxWidth="full"
      header={
        <div className="flex items-center justify-between w-full py-2">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Placement des candidats
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Session : <span className="text-primary">{sessionName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SeatingGeneratorDialog
              sessionId={sessionId!}
              yearId={yearId}
              schoolId={schoolId}
              hasAssignments={hasAssignments}
              sessionName={sessionName}
            />
          </div>
        </div>
      }
    >
      {hasAssignments ? (
        <div className="animate-in fade-in duration-500">
          <Outlet context={{ schoolId, yearId, sessionId, seatingSession }} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[500px] border border-dashed rounded-2xl bg-muted/5 mt-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur animate-pulse" />
            <div className="relative bg-background border p-4 rounded-full mb-6 shadow-sm">
              <Wand2 className="size-8 text-primary" />
            </div>
          </div>

          <h3 className="text-lg font-semibold tracking-tight">
            Configuration requise
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm text-center mt-2 px-6 leading-relaxed">
            Aucun plan de salle n'a été établi pour cette session. Utilisez le
            générateur pour répartir automatiquement vos candidats.
          </p>
        </div>
      )}
    </PageShell>
  );
};

SeatingSessionLayout.displayName = "SeatingSessionLayout";
