"use client";

import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import {
  PageContainer,
  PageContent,
  PageHeadTitle,
  PageHeadDescription,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";
import {
  InvoiGridContainer,
  InvoiGridFormContainer,
  InvoiGridPreviewContainer,
} from "@/renderer/containers/invoice-grid-container";
import {
  QuickEnrollmentForm,
  useEnrollmentStore,
} from "@/components/form/enrollments";
import { useCreateQuickEnrollmentForm } from "@/renderer/libs/queries/enrollements";
import type { EnrollmentDTO } from "@/packages/@core/data-access/db";
import { LoadingButton } from "@/components/buttons/button-loading";

/**
 * Properties for the EnrollmentForm component.
 */
interface EnrollmentFormProps {
  /** Unique identifier of the target school. */
  schoolId: string;
  /** Unique identifier of the target academic year. */
  yearId: string;
  /** Optional callback invoked when enrollment succeeds. */
  onSuccess?: (enrollment: EnrollmentDTO) => void;
}

/**
 * Renders the quick enrollment form with search capabilities and submit controls.
 * @param props - Form configuration including schoolId, yearId, and success callback.
 * @returns The rendered quick enrollment form element.
 */
export function EnrollmentForm({
  schoolId,
  yearId,
  onSuccess,
}: EnrollmentFormProps): React.JSX.Element {
  const form = useCreateQuickEnrollmentForm({ schoolId, yearId, onSuccess });

  return (
    <div className="space-y-4">
      <QuickEnrollmentForm
        formId={form.formId}
        classrooms={form.searchClassroom}
        students={form.searchUser}
        tutors={form.searchTutor}
        onSubmit={(value) => {
          console.log("value", value);
          //   form.onSubmit(value);
        }}
        defaultValues={{ yearId, schoolId }}
      />
      <LoadingButton
        loading={form.isSubmiting}
        form={form.formId}
        type="submit"
        className="w-full"
      >
        Enregistrer
      </LoadingButton>
    </div>
  );
}

/**
 * Main enrollment terminal page component orchestrating configuration and layout.
 * @returns The complete student enrollment terminal interface.
 */
export function EnrollmentPage(): React.JSX.Element {
  const { schoolId = "", yearId = "" } = useCurrentConfig();
  const addEnrollment = useEnrollmentStore((store) => store.addEnrollment);

  const isConfigReady = Boolean(schoolId && yearId);

  return (
    <PageContainer>
      <PageHeader className="border-b pb-5 mb-2">
        <PageHeaderTextContent>
          <PageHeadTitle>Terminal d'inscription</PageHeadTitle>
          <PageHeadDescription>
            Gérez les nouvelles inscriptions des élèves pour l'année académique
            en cours.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>

      <PageContent className="pt-5">
        <InvoiGridContainer>
          <InvoiGridFormContainer>
            {isConfigReady ? (
              <EnrollmentForm
                schoolId={schoolId}
                yearId={yearId}
                onSuccess={(enrollment) => {
                  console.log("Return", enrollment);
                  addEnrollment(enrollment);
                }}
              />
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Veuillez sélectionner une école et une année académique valide.
              </div>
            )}
          </InvoiGridFormContainer>

          <InvoiGridPreviewContainer>
            <div className="p-4 border rounded-md">
              <h2 className="text-lg font-semibold">
                Aperçu du reçu d'inscription
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Le détail de la facture s'affichera ici après la sélection de
                l'élève.
              </p>
            </div>
          </InvoiGridPreviewContainer>
        </InvoiGridContainer>
      </PageContent>
    </PageContainer>
  );
}
