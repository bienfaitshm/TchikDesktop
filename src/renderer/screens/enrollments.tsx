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
import {
  QuickEnrollmentForm,
  useEnrollmentStore,
} from "@/components/form/enrollments";
import {
  useCreateQuickEnrollmentForm,
  useGetEnrollmentById,
} from "@/renderer/libs/queries/enrollements";
import { LoadingButton } from "@/components/buttons/button-loading";
import { EnrollmentInvoice } from "@/components/invoices/enrollment-invoice";
import {
  ActionPrintContainer,
  PrinterConfigView,
  PrintInvoiceButton,
} from "@/components/invoices/invoice-print";
import { usePrintInvoiceForm } from "@/renderer/libs/queries/printing";
import { CapacityInfo } from "@/renderer/apps/searching/components/capcity-infos";
import {
  useInvoiceStore,
  InvoicePreview,
  InvoiceEmptyMessage,
  type Invoice,
} from "@/renderer/libs/invoice-preview-printing";
import { Suspense } from "../libs/queries/suspense";

/**
 * Properties for the EnrollmentForm component.
 */
interface EnrollmentFormProps {
  /** Unique identifier of the target school. */
  schoolId: string;
  /** Unique identifier of the target academic year. */
  yearId: string;
  /** Optional callback triggered on successful enrollment creation. */
  onSuccess?: (enrollment: any) => void;
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
  const addInvoice = useInvoiceStore((state) => state.addInvoice);

  const form = useCreateQuickEnrollmentForm({
    schoolId,
    yearId,
    onSuccess(enrollment) {
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
 * Properties for the InvoiceEnrollmentPrinting component.
 */
interface InvoiceEnrollmentPrintingProps {
  /** The invoice record to print. */
  invoice: Invoice;
}

/**
 * Manages invoice printing actions and receipt rendering for a given enrollment.
 * @param props - Properties containing the invoice record.
 * @returns The action container and receipt preview element.
 */
export function InvoiceEnrollmentPrinting({
  invoice,
}: InvoiceEnrollmentPrintingProps): React.JSX.Element {
  const markEnrollmentAsPrinted = useInvoiceStore(
    (state) => state.markAsPrinted,
  );
  const { data: enrollment } = useGetEnrollmentById(invoice.id);

  const mutation = usePrintInvoiceForm({
    onSuccess() {
      markEnrollmentAsPrinted(invoice.id);
    },
  });

  const handlePrint = (): void => {
    mutation.onSubmit({
      invoiceCode: "enrollment",
      id: invoice.id,
      invoiceRef: invoice.invoiceRef,
    });
  };

  const guardianData = enrollment?.tutor
    ? {
        name: enrollment.tutor.fullName,
        phone: enrollment.tutor.phoneNumber ?? "-",
        address: enrollment.tutor.address ?? "-",
      }
    : undefined;

  return (
    <ActionPrintContainer
      isPending={mutation.isSubmitting}
      isPrinted={invoice.isPrinted}
    >
      <EnrollmentInvoice
        student={{
          code: enrollment?.studentCode ?? invoice.invoiceRef,
          name: enrollment?.student?.fullName ?? "",
          classroom: enrollment?.classroom?.shortIdentifier ?? "",
        }}
        guardian={guardianData}
        invoiceRef={invoice.invoiceRef}
      />
      <PrinterConfigView>
        {() => (
          <PrintInvoiceButton
            isPrinted={invoice.isPrinted}
            isPrinting={mutation.isSubmitting}
            isReady={true}
            onClick={handlePrint}
          />
        )}
      </PrinterConfigView>
    </ActionPrintContainer>
  );
}

/**
 * Renders the preview panel container for enrollment receipts with empty state handling.
 * @returns The rendered preview panel component.
 */
export function EnrollmentInvoicePreview(): React.JSX.Element {
  return (
    <InvoicePreview type="enrollment" messageInfo={<InvoiceEmptyMessage />}>
      {(invoice) => (
        <Suspense>
          <InvoiceEnrollmentPrinting invoice={invoice} />
        </Suspense>
      )}
    </InvoicePreview>
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
        <PageHeadAction>
          <CapacityInfo schoolId={schoolId} yearId={yearId} />
        </PageHeadAction>
      </PageHeader>

      <PageContent className="pt-5" key={`${schoolId}-${yearId}`}>
        <InvoiceGridContainer>
          <InvoiceGridFormContainer>
            {isConfigReady ? (
              <EnrollmentForm
                schoolId={schoolId}
                yearId={yearId}
                onSuccess={(enrollment) => {
                  addEnrollment(enrollment);
                }}
              />
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Veuillez sélectionner une école et une année académique valide.
              </div>
            )}
          </InvoiceGridFormContainer>

          <InvoiceGridPreviewContainer>
            <EnrollmentInvoicePreview />
          </InvoiceGridPreviewContainer>
        </InvoiceGridContainer>
      </PageContent>
    </PageContainer>
  );
}
