"use client";

import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { Wand2 } from "lucide-react"; // Icônes pour l'UX
import { useGenerateSeating } from "@/renderer/libs/queries/seating";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/components/layouts/page-shell.layout";
import { SeatingGeneratorDialog } from "@/renderer/dialog-actions/seating-generator.dialog-actions";
import { SeatingViewer } from "@/renderer/components/layouts/seatings/viewer";

export const SeatingSessionDetailPage = () => {
  const { sessionId } = useParams();
  const { schoolId, yearId } = useSchoolContext();
  const [rooms, setRooms] = useState([]);

  const { mutateAsync: generate, isPending } = useGenerateSeating();

  const handleGenerate = useCallback(async () => {
    try {
      const result = await generate({
        schoolId,
        yearId,
      });
      setRooms(result);
    } catch (error) {
      console.error("Erreur de génération:", error);
    }
  }, [generate, schoolId, yearId, sessionId]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="full"
        header={
          <div className="flex items-center justify-between w-full py-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Placement des candidats
              </h1>
              <p className="text-sm text-muted-foreground">
                Générez et visualisez la répartition des élèves par salle.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SeatingGeneratorDialog
                hasGenerated={rooms.length > 0}
                isLoading={isPending}
                onGenerate={handleGenerate}
              />
            </div>
          </div>
        }
      >
        <div className="flex flex-col space-y-6">
          {rooms.length > 0 ? (
            <SeatingViewer sessionId={sessionId as string} rooms={rooms} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl bg-muted/5">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Wand2 className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Aucun placement généré</h3>
              <p className="text-muted-foreground max-w-xs text-center mt-2">
                Cliquez sur le bouton pour répartir automatiquement les
                candidats dans les salles disponibles.
              </p>
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
};
