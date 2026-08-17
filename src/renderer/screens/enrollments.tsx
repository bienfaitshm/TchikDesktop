"use client";

import React from "react";
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
  InvoiceGridContainer,
  InvoiceGridFormContainer,
  InvoiceGridPreviewContainer,
} from "@/renderer/containers/invoice-grid-container";
import {
  QuickEnrollmentForm,
  StoreEnrollment,
  useEnrollmentStore,
} from "@/components/form/enrollments";
import { useCreateQuickEnrollmentForm } from "@/renderer/libs/queries/enrollements";
import type { EnrollmentDTO } from "@/packages/@core/data-access/db";
import { LoadingButton } from "@/components/buttons/button-loading";
import { EnrollmentInvoice } from "../components/invoices/enrollment-invoice";
import {
  ActionPrintContainer,
  PrinterConfigView,
  PrintInvoiceButton,
} from "@/components/invoices/invoice-print";
import { usePrintInvoiceForm } from "@/renderer/libs/queries/printing";

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
  /** Enrollment record to be printed. */
  enrollment: StoreEnrollment;
}

/**
 * Manages invoice printing actions and receipt rendering for a given enrollment.
 * @param props - Component props containing the enrollment record.
 * @returns The action container and receipt preview element.
 */
export function InvoiceEnrollmentPrinting({
  enrollment,
}: InvoiceEnrollmentPrintingProps): React.JSX.Element {
  const markEnrollmentAsPrinted = useEnrollmentStore(
    (store) => store.markEnrollmentAsPrinted,
  );

  const mutation = usePrintInvoiceForm({
    onSuccess() {
      markEnrollmentAsPrinted(enrollment.enrollmentRef);
    },
  });

  const handlePrint = (): void => {
    mutation.onSubmit({
      invoiceCode: "enrollment",
      id: enrollment.enrollmentId,
      invoiceRef: enrollment.enrollmentRef,
    });
  };

  const guardianData = enrollment.tutor
    ? {
        name: enrollment.tutor.fullName,
        phone: enrollment.tutor.phoneNumber ?? "-",
        address: enrollment.tutor.address ?? "-",
      }
    : undefined;

  return (
    <ActionPrintContainer
      isPending={mutation.isSubmitting}
      isPrinted={enrollment.isPrinted}
    >
      <EnrollmentInvoice
        student={{
          code: enrollment.studentCode,
          name: enrollment.student.fullName,
          classroom: enrollment.classroom.shortIdentifier,
        }}
        guardian={guardianData}
        invoiceRef={enrollment.enrollmentRef}
      />
      <PrinterConfigView>
        {() => {
          return (
            <PrintInvoiceButton
              isPrinted={enrollment.isPrinted}
              isPrinting={mutation.isSubmitting}
              isReady={true}
              onClick={handlePrint}
            />
          );
        }}
      </PrinterConfigView>
    </ActionPrintContainer>
  );
}

/**
 * Properties for the EnrollmentInvoicePreview component.
 */
interface EnrollmentInvoicePreviewProps {
  /** The most recently saved enrollment record to display. */
  lastEnrollment?: StoreEnrollment | null;
}

/**
 * Renders the preview panel container for enrollment receipts with empty state handling.
 * @param props - Component props containing the last enrollment record.
 * @returns The rendered preview panel component.
 */
export function EnrollmentInvoicePreview({
  lastEnrollment,
}: EnrollmentInvoicePreviewProps): React.JSX.Element {
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-base font-semibold">Aperçu du reçu d'inscription</h2>

      {lastEnrollment ? (
        <InvoiceEnrollmentPrinting enrollment={lastEnrollment} />
      ) : (
        <p className="text-sm text-muted-foreground mt-1">
          Le détail du reçu s'affichera ici une fois l'inscription de l'élève
          enregistrée.
        </p>
      )}
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
  const lastEnrollment = useEnrollmentStore((store) =>
    store.getLastEnrollment(),
  );

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
            <EnrollmentInvoicePreview lastEnrollment={lastEnrollment} />
          </InvoiceGridPreviewContainer>
        </InvoiceGridContainer>
      </PageContent>
    </PageContainer>
  );
}
