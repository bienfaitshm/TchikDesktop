"use client";

import { useCallback, useMemo } from "react";
import { Link } from "react-router";
import { HistoryIcon, Table2Icon } from "lucide-react";

import {
  ActionPrintContainer,
  PrinterConfigView,
  PrintInvoiceButton,
} from "@/renderer/components/invoices/invoice-print";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { PaymentInvoice } from "@/renderer/components/invoices/payment-invoice";
import { Button } from "@/renderer/components/ui/button";
import { APP_ROUTES } from "@/renderer/constants";
import {
  InvoiceGridContainer,
  InvoiceGridFormContainer,
  InvoiceGridPreviewContainer,
} from "@/renderer/containers/invoice-grid-container";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeadTitle,
  PageHeadDescription,
  PageHeadAction,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";
import { useProcessStudentPaymentForm } from "@/renderer/libs/queries/finances";
import { usePrintInvoiceForm } from "@/renderer/libs/queries/printing";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";

import { PaymentHistoryDialog } from "@/renderer/apps/finances/dialog/payment-history-dialog";
import { FastPaymentForm } from "@/renderer/apps/finances/forms/fast-payment";
import {
  derivePreviewTicket,
  useFastPaymentStore,
} from "@/renderer/apps/finances/forms/fast-payment/hooks";
import type { FastPaymentState } from "@/renderer/apps/finances/forms/fast-payment/hooks";

/**
 * Point-of-sale terminal page component for processing student payments.
 * @returns The fast payment page view element.
 */
export function FastPaymentPage(): React.JSX.Element {
  return (
    <PageContainer className="flex flex-col gap-6">
      <PageHeader className="border-b pb-5 mb-2">
        <PageHeaderTextContent>
          <PageHeadTitle>Terminal de Caisse</PageHeadTitle>
          <PageHeadDescription>
            Saisie rapide des encaissements physiques au guichet et édition
            instantanée des reçus d'écolage.
          </PageHeadDescription>
        </PageHeaderTextContent>
        <PageHeadAction className="flex items-center gap-2">
          <Link to={APP_ROUTES.FIN.CLASSROOMS.LIST}>
            <Button variant="outline" size="sm">
              <Table2Icon data-icon="inline-start" />
              Tableau de paiement
            </Button>
          </Link>
          <PaymentHistoryDialog>
            <Button variant="outline" size="sm">
              <HistoryIcon data-icon="inline-start" />
              Historique
            </Button>
          </PaymentHistoryDialog>
        </PageHeadAction>
      </PageHeader>
      <PageContent>
        <InvoiceGridContainer>
          <InvoiceGridFormContainer>
            <PaymentForm />
          </InvoiceGridFormContainer>
          <InvoiceGridPreviewContainer>
            <InvoicePrinting />
          </InvoiceGridPreviewContainer>
        </InvoiceGridContainer>
      </PageContent>
    </PageContainer>
  );
}

/**
 * Renders and handles student payment checkout form logic.
 * @returns The payment form section element.
 */
export function PaymentForm(): React.JSX.Element {
  const { schoolId = "", yearId = "" } = useCurrentConfig();
  const resetForm = useFastPaymentStore((store) => store.resetForm);

  const form = useProcessStudentPaymentForm({
    schoolId,
    yearId,
    onSuccess(data) {
      if (data) {
        resetForm(data);
      }
    },
  });

  return (
    <div className="space-y-4">
      <FastPaymentForm
        formId={form.formId}
        schoolId={schoolId}
        yearId={yearId}
        currencyOptions={form.currencyOptions}
        paymentMethodOptions={form.paymentMethodOptions}
        onSubmit={form.onSubmit}
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
 * Manages invoice preview state and executes ticket print mutations.
 * @returns The invoice printing action section element.
 */
export function InvoicePrinting(): React.JSX.Element {
  const selectedStudent = useFastPaymentStore((state) => state.selectedStudent);
  const selectedFeeType = useFastPaymentStore((state) => state.selectedFeeType);
  const selectedSchedule = useFastPaymentStore(
    (state) => state.selectedSchedule,
  );
  const firstTicket = useFastPaymentStore((state) => state.tickets[0]);
  const markTicketAsPrinted = useFastPaymentStore(
    (state) => state.markTicketAsPrinted,
  );

  const lastInvoice = useMemo(
    () =>
      derivePreviewTicket({
        selectedStudent,
        selectedFeeType,
        selectedSchedule,
        tickets: firstTicket ? [firstTicket] : [],
      } as FastPaymentState),
    [selectedStudent, selectedFeeType, selectedSchedule, firstTicket],
  );

  const payment = lastInvoice?.payment;
  const student = lastInvoice?.student;
  const invoiceRef = lastInvoice?.invoiceRef;
  const isModePreview = lastInvoice?.isModePreview;
  const isPrinted = Boolean(lastInvoice?.isPrinted);

  const isReady = Boolean(payment?.paymentId && invoiceRef && !isModePreview);

  const handlePrintSuccess = useCallback((): void => {
    if (invoiceRef) {
      markTicketAsPrinted(invoiceRef);
    }
  }, [invoiceRef, markTicketAsPrinted]);

  const { isSubmitting, onSubmit } = usePrintInvoiceForm({
    onSuccess: handlePrintSuccess,
  });

  const handlePrint = useCallback((): void => {
    if (payment?.paymentId && invoiceRef) {
      onSubmit({
        invoiceCode: "payment",
        id: payment.paymentId,
        invoiceRef,
      });
    }
  }, [payment?.paymentId, invoiceRef, onSubmit]);

  return (
    <ActionPrintContainer isPending={isSubmitting} isPrinted={isPrinted}>
      {payment && student ? (
        <PaymentInvoice
          payment={{
            ...payment,
            dueAmount: payment.totalDue,
            paidAmount: payment.amountPaid,
            receivedAmount: payment.amountPaid,
          }}
          student={student}
          invoiceRef={invoiceRef}
        />
      ) : null}
      <PrinterConfigView>
        {() => (
          <PrintInvoiceButton
            isPrinted={isPrinted}
            isPrinting={isSubmitting}
            isReady={isReady}
            onClick={handlePrint}
          />
        )}
      </PrinterConfigView>
    </ActionPrintContainer>
  );
}
