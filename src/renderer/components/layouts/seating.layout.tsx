"use client";

import * as React from "react";
import { useParams, Outlet, useNavigate } from "react-router";
import { ChevronLeft, Wand2 } from "lucide-react";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/components/layouts/page-shell.layout";
import { SeatingGeneratorDialog } from "@/renderer/dialog-actions/seating-generator";
import { useGetSeatingSessionById } from "@/renderer/libs/queries/seating";
import { SidebarContainer } from "@/renderer/components/sidebar-container";
import { LocalroomSidebar } from "@/renderer/components/localroom-sidebar";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { Button } from "../ui/button";
import { ButtonDialogDocumentExport } from "@/renderer/dialog-actions/dialog-document-expoter-actions";
import { useInvalidateSeatingCache } from "@/renderer/dialog-actions/seating-generator/hooks";

export interface SeatingLayoutContext {
  schoolId: string;
  yearId: string;
  sessionId: string;
  seatingSession: NonNullable<
    ReturnType<typeof useGetSeatingSessionById>["data"]
  >;
}

export const SeatingSessionLayout: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { schoolId, yearId } = useSchoolContext();
  const invalidate = useInvalidateSeatingCache();

  if (!sessionId) {
    return (
      <p className="text-destructive p-4">
        Erreur : Session ID introuvable dans l'URL.
      </p>
    );
  }

  const { data: seatingSession, isLoading } =
    useGetSeatingSessionById(sessionId);

  if (isLoading) {
    return (
      <PageShell maxWidth="full" header={<Skeleton className="h-14 w-full" />}>
        <div className="p-6">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </PageShell>
    );
  }

  if (!seatingSession) return null;

  const { hasAssignments, sessionName } = seatingSession;

  const generatorDialogProps = {
    sessionId,
    yearId,
    schoolId,
    hasAssignments,
    sessionName,
    onSuccess: invalidate,
  };

  if (!hasAssignments) {
    return (
      <EmptyMessage sessionName={sessionName}>
        <SeatingGeneratorDialog {...generatorDialogProps} />
      </EmptyMessage>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
      <SidebarContainer direction="horizontal" sidebar={<LocalroomSidebar />}>
        <header className="px-4 pb-2 pt-6 md:px-10 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center max-w-screen-2xl mx-auto">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {sessionName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ButtonDialogDocumentExport
                key={sessionId}
                schoolId={schoolId}
                yearId={yearId}
                defaultValues={{ sessionId }}
              />
              <SeatingGeneratorDialog {...generatorDialogProps} />
            </div>
          </div>
        </header>

        <Outlet
          context={
            {
              schoolId,
              yearId,
              sessionId,
              seatingSession,
            } satisfies SeatingLayoutContext
          }
        />
      </SidebarContainer>
    </div>
  );
};

export const EmptyMessage: React.FC<
  React.PropsWithChildren<{ sessionName?: string }>
> = ({ children, sessionName }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full mt-5">
      <header className="flex flex-row items-center gap-4 sm:gap-6">
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0 rounded-xl shadow-sm hover:bg-accent"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-5" />
          <span className="sr-only">Retour</span>
        </Button>

        <div className="space-y-1">
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl lg:text-xl">
            {sessionName}
          </h1>
          <p className="text-sm text-muted-foreground leading-none">
            Configuration du plan de salle et répartition des candidats.
          </p>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center min-h-[65vh] border-2 border-dashed rounded-[2rem] bg-muted/5 mt-4 transition-colors hover:bg-muted/10">
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl animate-pulse" />
          <div className="relative bg-background border shadow-sm p-6 rounded-3xl">
            <Wand2 className="size-12 text-primary" />
          </div>
        </div>

        <h3 className="text-2xl font-semibold tracking-tight">
          Plan de salle vide
        </h3>
        <p className="text-muted-foreground max-w-sm text-center mt-3 leading-relaxed">
          Organisez vos candidats en quelques clics. Utilisez le générateur pour
          assigner automatiquement les places.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          {children}
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Action requise pour continuer
          </p>
        </div>
      </div>
    </div>
  );
};
