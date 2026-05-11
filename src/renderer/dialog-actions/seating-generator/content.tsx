import React from "react";
import { Wand2 } from "lucide-react"; // Icônes pour l'UX
import { SeatingViewer } from "@/renderer/libs/seating-viewer";
import { RoomState } from "@/renderer/components/layouts/seatings/hooks";

export type SeatingGeneratorContentProps = {
  rooms?: RoomState[];
  hasGenerate?: boolean;
  sessionId: string;
};

export const SeatingGeneratorContent: React.FC<
  SeatingGeneratorContentProps
> = ({ hasGenerate, sessionId, rooms = [] }) => {
  return (
    <div className="flex flex-col space-y-6">
      {hasGenerate ? (
        <SeatingViewer sessionId={sessionId} rooms={rooms} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl bg-muted/5">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Wand2 className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Aucun placement généré</h3>
          <p className="text-muted-foreground max-w-xs text-center mt-2">
            Cliquez sur le bouton pour répartir automatiquement les candidats
            dans les salles disponibles.
          </p>
        </div>
      )}
    </div>
  );
};
