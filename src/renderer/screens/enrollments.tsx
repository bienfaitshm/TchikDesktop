"use client";

import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import {
  PageContainer,
  PageContent,
  PageHeadTitle,
  PageHeadDescription,
  PageHeader,
  PageHeaderTextContent,
  PageHeadAction,
} from "@/renderer/containers/page-container";
import {
  InvoiceGridContainer,
  InvoiceGridFormContainer,
  InvoiceGridPreviewContainer,
} from "@/renderer/containers/invoice-grid-container";
import { QuickEnrollmentForm } from "@/components/form/enrollments";
import { useCreateQuickEnrollmentForm } from "@/renderer/libs/queries/enrollements";
import { LoadingButton } from "@/components/buttons/button-loading";
import { CapacityInfo } from "@/renderer/apps/searching/components/capcity-infos";
import {
  useInvoiceStore,
  InvoicePreview,
  InvoiceEmptyMessage,
} from "@/renderer/libs/invoice-preview-printing";
import { InvoicePrintContainer } from "@/components/invoices";
import { EnrollmentInvoiceContent } from "@/renderer/apps/schools/components/enrollment-invoice-printable";

/**
 * Representation of an enrollment entity.
 */
interface Enrollment {
  enrollmentId: string;
  studentCode: string;
  createdAt: Date;
  [key: string]: unknown;
}

/**
 * Properties for the EnrollmentForm component.
 */
interface EnrollmentFormProps {
  /** Unique identifier of the target school. */
  schoolId: string;
  /** Unique identifier of the target academic year. */
  yearId: string;
  /** Optional callback triggered on successful enrollment creation. */
  onSuccess?: (enrollment: Enrollment) => void;
}

/**
 * Custom hook encapsulating enrollment submission mutation logic and side effects.
 * @param schoolId - Unique school identifier.
 * @param yearId - Unique academic year identifier.
 * @param onSuccess - Optional callback on success.
 * @returns The form control object and submission state.
 */
function useEnrollmentFormSubmission(
  schoolId: string,
  yearId: string,
  onSuccess?: (enrollment: Enrollment) => void,
) {
  const addInvoice = useInvoiceStore((state) => state.addInvoice);

  return useCreateQuickEnrollmentForm({
    schoolId,
    yearId,
    onSuccess(enrollment: Enrollment) {
      addInvoice({
        date: enrollment.createdAt,
        id: enrollment.enrollmentId,
        invoiceRef: enrollment.studentCode,
        isPrinted: false,
        type: "enrollment",
      });
      onSuccess?.(enrollment);
    },
    mutationKey: ["schools"],
  });
}

/**
 * Renders the quick enrollment form with search capabilities and submit controls.
 * @param props - Configuration including schoolId, yearId, and success callback.
 * @returns The rendered quick enrollment form element.
 */
export function EnrollmentForm({
  schoolId,
  yearId,
  onSuccess,
}: EnrollmentFormProps): React.JSX.Element {
  const form = useEnrollmentFormSubmission(schoolId, yearId, onSuccess);

  return (
    <div className="space-y-4">
      <QuickEnrollmentForm
        formId={form.formId}
        classrooms={form.searchClassroom}
        students={form.searchUser}
        tutors={form.searchTutor}
        onSubmit={form.onSubmit}
        defaultValues={{ yearId, schoolId }}
      />
      <LoadingButton
        loading={form.isSubmitting}
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
  const isConfigReady = Boolean(schoolId && yearId);

  return (
    <PageContainer className="sm:px-12 lg:px-14">
      <PageHeader className="border-b pb-5 mb-2">
        <PageHeaderTextContent>
          <PageHeadTitle>Terminal d'inscription</PageHeadTitle>
          <PageHeadDescription>
            Gérez les nouvelles inscriptions des élèves pour l'année académique
            en cours.
          </PageHeadDescription>
        </PageHeaderTextContent>
        <PageHeadAction>
          <CapacityInfo schoolId={schoolId} yearId={yearId} />
        </PageHeadAction>
      </PageHeader>

      <PageContent className="pt-5" key={`${schoolId}-${yearId}`}>
        <InvoiceGridContainer>
          <InvoiceGridFormContainer>
            {isConfigReady ? (
              <EnrollmentForm schoolId={schoolId} yearId={yearId} />
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Veuillez sélectionner une école et une année académique valide.
              </div>
            )}
          </InvoiceGridFormContainer>

          <InvoiceGridPreviewContainer>
            <InvoicePreview
              type="enrollment"
              messageInfo={<InvoiceEmptyMessage />}
            >
              {(invoice) => (
                <InvoicePrintContainer
                  invoice={invoice}
                  invoiceContent={EnrollmentInvoiceContent}
                />
              )}
            </InvoicePreview>
          </InvoiceGridPreviewContainer>
        </InvoiceGridContainer>
      </PageContent>
    </PageContainer>
  );
}
