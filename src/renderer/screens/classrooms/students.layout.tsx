import { WithSchoolAndYearId } from "@/commons/types/services";
import { ClassroomSideList } from "@/renderer/components/classroom-side-list";
import { Button } from "@/renderer/components/ui/button";
import { TypographyH2 } from "@/renderer/components/ui/typography";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { ArrowLeft } from "lucide-react";
import { Outlet, useNavigate } from "react-router";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/renderer/components/ui/resizable";
import { Separator } from "@/renderer/components/ui/separator";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";


/**
 * Composant de navigation latérale pour les classes.
 * Récupère la liste des classes et les passe à ClassroomSideList.
 * @param {WithSchoolAndYearId} props - schoolId et yearId pour récupérer les classes.
 */
const ClassroomSideNav: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const { data: classrooms = [] } = useGetClassrooms({ schoolId, yearId });
    return <ClassroomSideList classrooms={classrooms} />;
};

/**
 * Layout principal pour les sections liées aux étudiants et aux classes.
 * Utilise un layout redimensionnable avec une barre latérale et une zone de contenu principale.
 * @param {WithSchoolAndYearId} props - schoolId et yearId passés par le HOC withSchoolConfig.
 */
const Layout: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="h-[calc(100vh-64px)]">
            <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[650px] h-full"
            >
                {/* Panneau de la barre latérale (liste des classes) */}
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <div className="flex flex-col h-full p-4 space-y-4">
                        {/* En-tête de la barre latérale */}
                        <div className="flex items-center gap-2">
                            <Button onClick={handleGoBack} size="icon" variant="outline" className="h-8">
                                <ArrowLeft />
                            </Button>
                            <TypographyH2 className="mb-0 pb-0 text-md font-semibold">Listes des classes</TypographyH2>
                        </div>
                        <Separator />

                        {/* Zone de défilement pour la liste des classes */}
                        <ScrollArea className="flex-grow pr-2">
                            <Suspense>
                                <ClassroomSideNav schoolId={schoolId} yearId={yearId} />
                            </Suspense>
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                {/* Poignée de redimensionnement */}
                <ResizableHandle withHandle />

                {/* Panneau du contenu principal */}
                <ResizablePanel defaultSize={75}>
                    <ScrollArea className="h-full bg-background">
                        <div className="mx-auto max-w-screen-lg mt-10">
                            <Outlet />
                        </div>
                    </ScrollArea>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export const StudentsLayout = withSchoolConfig(Layout);
