import React from 'react';

import { WithSchoolAndYearId } from '@/commons/types/services';

// --- UI Component Imports ---
import { Button } from '@/renderer/components/ui/button';
import { TypographyH1 } from '@/renderer/components/ui/typography';
import { DataTable, DataContentHead, DataTableContent, DataContentBody } from '@/renderer/components/tables';
import { EnrollmentHistoricsColumns } from '@/renderer/components/tables/columns.enrollment-history';


import { Suspense } from '@/renderer/libs/queries/suspense';
import { withSchoolConfig } from '@/renderer/hooks/with-application-config';
import { EnrollmentDialog } from '../components/dialog/quick-enrollment-dialog-form';
// Assuming you have a hook to fetch the enrollment history

// ============================================================================
// 1. CHILD COMPONENT: Enrollment History Table
// ============================================================================

/**
 * @description Renders the data table for enrollment history.
 * It is responsible for fetching and displaying its own data.
 */
const EnrollmentHistoryTable: React.FC<WithSchoolAndYearId> = ({ }) => {
    // This hook fetches the data for the table, handling loading and error states.
    // const { data: enrollments, isLoading } = useGetEnrollmentHistory({ schoolId, yearId });

    return (
        <DataTable
            columns={EnrollmentHistoricsColumns}
            data={[]} // Use fetched data, with a fallback for initial render
            keyExtractor={(row) => `${row.enrolementId}`}
        >
            <DataTableContent>
                <DataContentHead />
                <DataContentBody />
            </DataTableContent>
        </DataTable>
    );
};

// ============================================================================
// 3. PARENT COMPONENT: Enrollment Page
// ============================================================================

/**
 * @description The main page for managing enrollments.
 * It composes the header, action buttons (dialog), and the data table.
 */
const EnrollmentPage: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    return (
        <div className="container mx-auto max-w-screen-lg py-10">
            <header className="flex items-center justify-between mb-8">
                <TypographyH1>Historique des inscriptions</TypographyH1>

                {/* Suspense is great if the dialog or its data dependencies are lazy-loaded */}
                <Suspense fallback={<Button size="sm" disabled>Chargement...</Button>}>
                    <EnrollmentDialog schoolId={schoolId} yearId={yearId}>
                        <Button size="sm">Nouvelle inscription</Button>
                    </EnrollmentDialog>
                </Suspense>
            </header>

            <main>
                <Suspense fallback={<div>Chargement de l'historique...</div>}>
                    <EnrollmentHistoryTable schoolId={schoolId} yearId={yearId} />
                </Suspense>
            </main>
        </div>
    );
};


export const QuickEnrollmentPage = withSchoolConfig(EnrollmentPage);