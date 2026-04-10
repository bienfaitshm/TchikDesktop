import React from 'react';
import { Zap, UserPlus, History } from 'lucide-react';

import { Button } from '@/renderer/components/ui/button';
import { TypographyP } from '@/renderer/components/ui/typography';
import {
    DataTable,
    DataContentHead,
    DataTableContent,
    DataContentBody,
    DataTablePagination
} from '@/renderer/components/tables';
import { EnrollmentHistoricsColumns } from '@/renderer/components/tables/columns.enrollment-history';
import { Suspense } from '@/renderer/libs/queries/suspense';
import { withSchoolConfig } from '@/renderer/hooks/with-application-config';
import {
    QuickCreateEnrollmentDialog,
    CreateEnrollmentDialog
} from '@/renderer/dialog-actions/enrolement.dialog-actions';
import { useGetEnrollments } from '@/renderer/libs/queries/enrolement';
import { Skeleton } from '@/renderer/components/ui/skeleton';


type SchoolYearId = { schoolId: string; yearId: string };




/**
 * Composant de table avec gestion des données réelles
 */
const EnrollmentHistoryTable: React.FC<SchoolYearId> = ({ schoolId, yearId }) => {
    // Appel réel des données
    const { data = [] } = useGetEnrollments({
        where: { schoolId, yearId }
    });
    console.log(data)

    return (
        <section aria-labelledby="table-title">
            <h2 id="table-title" className="sr-only">Liste des inscriptions</h2>
            <DataTable
                columns={EnrollmentHistoricsColumns}
                data={[]}
                keyExtractor={(row) => row.id ?? `${row.enrolementId}`}
            >
                {/* {className="bg-muted/50"} */}
                <DataTableContent>
                    <DataContentHead />
                    <DataContentBody />
                </DataTableContent>
                <DataTablePagination />
            </DataTable>

            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <TypographyP className="text-muted-foreground">
                        Aucun historique d'inscription trouvé pour cette période.
                    </TypographyP>
                </div>
            )}
        </section>
    );
};

/**
 * Skeleton pour un chargement élégant
 */
const TableSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
);

const EnrollmentPage: React.FC<SchoolYearId> = ({ schoolId, yearId }) => {
    const defaultValues = { schoolId, yearId };

    return (
        <div className="container mx-auto max-w-screen-xl py-10 px-4 sm:px-4">
            {/* Header avec Actions Groupées */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des Inscriptions</h1>
                    <p className="text-sm text-muted-foreground">
                        Consultez et gérez l'historique des enrôlements pour l'année scolaire en cours.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Inscription Rapide : Style "Accent" pour l'urgence/vitesse */}
                    <QuickCreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={defaultValues}>
                        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                            <Zap className="h-4 w-4" />
                            <span>Inscription Rapide</span>
                        </Button>
                    </QuickCreateEnrollmentDialog>

                    {/* Inscription Complète : Bouton Principal */}
                    <CreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={{ schoolId, yearId }}>
                        <Button className="gap-2 shadow-sm">
                            <UserPlus className="h-4 w-4" />
                            <span>Inscription Complète</span>
                        </Button>
                    </CreateEnrollmentDialog>
                </div>
            </header>

            <main>
                <Suspense fallback={<TableSkeleton />}>
                    <EnrollmentHistoryTable schoolId={schoolId} yearId={yearId} />
                </Suspense>
            </main>
        </div>
    );
};

export const QuickEnrollmentPage = withSchoolConfig(EnrollmentPage);