"use client"

import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { Wand2, RefreshCcw } from "lucide-react"; // Icônes pour l'UX
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useGenerateSeating } from "@/renderer/libs/queries/seating";
import GlobalRoomManager from "@/renderer/components/layouts/seatings/room-manager";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/components/layouts/page-shell.layout";

export const SeatingSessionDetailPage = () => {
    const { schoolId, yearId } = useSchoolContext();
    const { sessionId } = useParams();
    const [rooms, setRooms] = useState([]);
    
    const { mutateAsync: generate, isPending } = useGenerateSeating();

    const handleGenerate = useCallback(async () => {
        try {
            // On envoie les infos nécessaires à l'algorithme de placement
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
        <PageShell 
            maxWidth="full"
            header={
                <div className="flex items-center justify-between w-full py-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Placement des candidats</h1>
                        <p className="text-sm text-muted-foreground">
                            Générez et visualisez la répartition des élèves par salle.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ButtonLoader 
                            onClick={handleGenerate} 
                            isLoading={isPending}
                            variant={rooms.length > 0 ? "outline" : "default"}
                            className="rounded-full"
                        >
                            {isPending ? (
                                "Calcul du placement..."
                            ) : rooms.length > 0 ? (
                                <>
                                    <RefreshCcw className="mr-2 size-4" />
                                    Régénérer le plan
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 size-4" />
                                    Générer le placement
                                </>
                            )}
                        </ButtonLoader>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col space-y-6">
                {rooms.length > 0 ? (
                    <GlobalRoomManager 
                        sessionId={sessionId as string} 
                        rooms={rooms} 
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl bg-muted/5">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <Wand2 className="size-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Aucun placement généré</h3>
                        <p className="text-muted-foreground max-w-xs text-center mt-2">
                            Cliquez sur le bouton pour répartir automatiquement les candidats dans les salles disponibles.
                        </p>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
