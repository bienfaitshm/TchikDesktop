"use client"
import { Outlet, useParams } from "react-router"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/renderer/components/ui/resizable"
import { Suspense } from "@/renderer/libs/queries/suspense"
import { useGetClassrooms } from "@/renderer/libs/queries/classroom"
import { useSchoolContext } from "@/renderer/hooks/app-config-router"
import { ClassroomSidebar } from "@/renderer/components/classroom-sidebar"
import { PageShell } from "./page-shell.layout"
import { ClassroomHeader } from "@/renderer/components/classroom-student-header"

/**
 * Gestionnaire de données pour la liste latérale.
 */
const ClassroomSideNav = ({ schoolId, yearId }: { schoolId: string; yearId: string }) => {
    const { data: classrooms = [] } = useGetClassrooms({ where: { schoolId, yearId } });
    return <ClassroomSidebar classrooms={classrooms} />;
};

/**
 * Layout principal StudentLayout.
 */
export const StudentLayout = () => {
    const { classroomId } = useParams();
    const { schoolId, yearId } = useSchoolContext();

    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                <ResizablePanel
                    defaultSize={20}
                    minSize={18}
                    maxSize={30}
                    className="h-full bg-background"
                >
                    <Suspense fallback={
                        <div className="p-6 space-y-4 animate-pulse">
                            <div className="h-8 w-8 bg-muted rounded-lg" />
                            <div className="h-10 w-full bg-muted rounded-md" />
                            <div className="space-y-2">
                                <div className="h-4 w-1/2 bg-muted rounded" />
                                <div className="h-9 w-full bg-muted rounded" />
                                <div className="h-9 w-full bg-muted rounded" />
                            </div>
                        </div>
                    }>
                        <ClassroomSideNav schoolId={schoolId} yearId={yearId} />
                    </Suspense>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={80}>
                    <PageShell
                        maxWidth="2xl"
                        header={

                            classroomId ? <ClassroomHeader schoolId={schoolId} yearId={yearId} classId={classroomId} /> : null
                        }
                    >
                        <Outlet context={{ schoolId, yearId }} />
                    </PageShell>
                </ResizablePanel>

            </ResizablePanelGroup>
        </div>
    );
};