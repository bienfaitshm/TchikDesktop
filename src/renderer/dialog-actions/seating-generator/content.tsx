"use client";
import { SeatingViewer } from "@/renderer/libs/seating-viewer";
import type { RoomState } from "@/renderer/libs/seating-viewer";
import { CheckCircle2, RockingChair, Loader2, AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/renderer/components/ui/alert";

interface SeatingDisplayContentProps {
  isGenerating: boolean;
  hasData: boolean;
  hasAssignments: boolean;
  generatedRooms: RoomState[];
}

export const SeatingDisplayContent = ({
  isGenerating,
  hasData,
  hasAssignments,
  generatedRooms,
}: SeatingDisplayContentProps) => {
  // 1. État de chargement
  if (isGenerating) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center rounded-xl border border-dashed bg-background/50 animate-pulse text-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60 mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          Optimisation du plan de salle...
        </p>
      </div>
    );
  }

  // 2. État : Données fraîchement générées (Preview)
  if (hasData) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Alert
          variant="default"
          className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
        >
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            Prévisualisation
          </AlertTitle>
          <AlertDescription className="text-amber-700/80 dark:text-amber-500/80 text-xs">
            Ces placements ne sont pas encore enregistrés. Cliquez sur
            "Confirmer l'attribution" pour valider.
          </AlertDescription>
        </Alert>
        <SeatingViewer rooms={generatedRooms} />
      </div>
    );
  }

  // 3. État : Déjà généré en base (Stable)
  if (hasAssignments) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 rounded-xl border bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-4">
          <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-500" />
        </div>
        <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">
          Placement déjà finalisé
        </h4>
        <p className="text-sm text-emerald-700/70 dark:text-emerald-500/70 max-w-sm mt-2">
          La mise en place pour cette session a déjà été générée et enregistrée
          avec succès. Vous pouvez la modifier en relançant une génération
          ci-dessus.
        </p>
      </div>
    );
  }

  // 4. État initial : Rien
  return (
    <div className="h-[300px] flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-center p-8">
      <div className="bg-background size-12 flex items-center justify-center rounded-full mb-4 shadow-xs border">
        <RockingChair className="size-5 text-muted-foreground" />
      </div>
      <h4 className="font-medium text-foreground">Prêt pour la génération</h4>
      <p className="text-sm text-muted-foreground max-w-xs mt-1">
        Remplissez les paramètres pour visualiser la répartition.
      </p>
    </div>
  );
};
