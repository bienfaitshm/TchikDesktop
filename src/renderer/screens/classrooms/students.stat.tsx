import type { TEnrolement, TWithUser } from "@/commons/types/models";
import { Button } from "@/renderer/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/renderer/components/ui/sheet";
import { ChartPie } from "lucide-react";
import React from "react";

type ButtonSheetStudentStatProps = {
    students?: TWithUser<TEnrolement>[]
}
export const ButtonSheetStudentStat: React.FC<ButtonSheetStudentStatProps> = ({ students = [] }) => {
    return (
        <Sheet>

            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <ChartPie className="size-4" />
                    <span>Statistiques</span>
                </Button>
            </SheetTrigger>

            {/* SheetContent est le conteneur pour le contenu de la feuille latérale. */}
            <SheetContent className="flex flex-col sm:max-w-xl"> {/* Utilisation de flex-col pour un layout vertical simple */}
                {/* SheetHeader contient le titre et la description de la feuille. */}
                <SheetHeader className="pb-4 border-b"> {/* Ajout d'une bordure en bas pour séparer l'en-tête */}
                    <SheetTitle>Statistiques des élèves</SheetTitle> {/* Titre clair de la feuille */}
                    <SheetDescription>
                        Aperçu général des données des élèves de cette classe.
                    </SheetDescription>
                </SheetHeader>

                {/* Zone de contenu principale de la feuille.
            Ce div serait l'endroit où vous inséreriez vos graphiques, tableaux, etc. */}
                <div className="flex-1 overflow-y-auto py-4"> {/* flex-1 et overflow-y-auto pour que le contenu puisse défiler */}
                    {/* Placeholder pour vos graphiques ou données statistiques.
              Remplacez ceci par vos composants de visualisation de données (ex: Recharts, Tremor, etc.) */}
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-lg p-6">
                        <ChartPie className="size-12 mb-4 text-gray-400" />
                        <p className="text-lg font-semibold mb-2">Statistiques non implémentées</p>
                        <p className="text-sm text-center">
                            Les graphiques et les données statistiques seront affichés ici une fois implémentés.
                        </p>
                    </div>
                </div>

                {/* SheetFooter contient les actions, comme le bouton de fermeture. */}
                <SheetFooter className="pt-4 border-t"> {/* Ajout d'une bordure en haut pour séparer le pied de page */}
                    <SheetClose asChild>
                        <Button type="button" variant="outline">
                            Fermer
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
