"use client";

import { SECTION } from "@/commons/constants/enum";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { Suspense } from "@/renderer/libs/queries/suspense"; // Assurez-vous que Suspense est bien défini et fonctionnel
import { useParams } from "react-router"; // Utiliser react-router-dom pour useParams
import { ClassroomSectionView } from "./classrooms.view"; // Composant d'affichage des classes
import { withCurrentConfig } from "@/renderer/hooks/with-application-config"; // HOC pour la configuration
import React, { useState } from "react";
import { ClassroomTables } from "./classrooms.edition"; // Composant pour l'édition des classes
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/renderer/components/ui/tabs"; // Composants Tabs de Shadcn UI
import { LayoutGrid, ListTodo } from "lucide-react"; // Icônes pour les modes d'affichage

/**
 * Composant `Classrooms` (renommé `ClassroomContent` pour la clarté)
 * Gère l'affichage des classes et le basculement entre le mode "liste" (vue)
 * et le mode "édition" (tables), en fonction de l'onglet sélectionné.
 *
 * @param {WithSchoolAndYearId} props - schoolId et yearId injectés par withCurrentConfig.
 */
const ClassroomContent: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const { section } = useParams<{ section: SECTION }>();
    // Gère l'état du mode d'affichage : 'list' pour la vue normale, 'edit' pour le mode édition.
    const [viewMode, setViewMode] = useState<"list" | "edit">("list");

    return (
        <div className="space-y-6"> {/* Ajout d'un espacement vertical */}
            {/* Utilisation du composant Tabs de Shadcn UI pour basculer entre les vues */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "edit")}>
                <TabsList className="grid w-fit grid-cols-2 p-0 h-auto bg-transparent border-b rounded-none shadow-none"> {/* Styles modifiés ici */}
                    <TabsTrigger
                        value="list"
                        className="flex items-center gap-2 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none shadow-none text-muted-foreground hover:text-foreground pb-2 pt-0" // Styles modifiés ici
                    >
                        <ListTodo className="size-4" /> {/* Icône pour le mode Liste */}
                        <span>Vue Liste</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="edit"
                        className="flex items-center gap-2 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none shadow-none text-muted-foreground hover:text-foreground pb-2 pt-0" // Styles modifiés ici
                    >
                        <LayoutGrid className="size-4" /> {/* Icône pour le mode Édition */}
                        <span>Mode Édition</span>
                    </TabsTrigger>
                </TabsList>

                {/* Contenu de l'onglet "Vue Liste" */}
                <TabsContent value="list" className="mt-0"> {/* mt-0 pour annuler la marge par défaut des TabsContent */}
                    <Suspense>
                        {/* Affiche la vue des sections de classes */}
                        <ClassroomSectionView schoolId={schoolId} yearId={yearId} section={section} />
                    </Suspense>
                </TabsContent>

                {/* Contenu de l'onglet "Mode Édition" */}
                <TabsContent value="edit" className="mt-0"> {/* mt-0 pour annuler la marge par défaut des TabsContent */}
                    <Suspense>
                        {/* Affiche les tables d'édition des classes */}
                        <ClassroomTables schoolId={schoolId} yearId={yearId} /> {/* Passer les props nécessaires */}
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Le composant exporté est enveloppé par withCurrentConfig
// Cela garantit que schoolId et yearId sont disponibles ou qu'un message de configuration est affiché.
export const ClassroomPage = withCurrentConfig(ClassroomContent);
