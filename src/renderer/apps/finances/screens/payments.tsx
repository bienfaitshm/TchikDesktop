"use client";
import { Link } from "react-router";
import { HistoryIcon, Table2Icon } from "lucide-react";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
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
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { PaymentHistoryDialog } from "@/renderer/apps/finances/dialog/payment-history-dialog";
import { FastPaymentForm } from "@/renderer/apps/finances/forms/fast-payment";
import { useFastPaymentStore } from "@/renderer/apps/finances/forms/fast-payment/hooks";
import {
  useInvoiceStore,
  InvoicePreview,
  InvoiceEmptyMessage,
} from "@/renderer/libs/invoice-preview-printing";
import { InvoicePrintContainer } from "@/renderer/components/invoices";
import { PaymentInvoiceContainer } from "../components/payment-invoice-content";

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
            <InvoicePreview
              type="payment"
              messageInfo={
                <InvoiceEmptyMessage
                  title="Aperçu du reçu du paiement"
                  description="Le détail du reçu s'affichera ici une fois le paiement de l'élève enregistré."
                />
              }
            >
              {(invoice) => (
                <InvoicePrintContainer
                  invoice={invoice}
                  invoiceContent={PaymentInvoiceContainer}
                  showPrintButton={false}
                />
              )}
            </InvoicePreview>
          </InvoiceGridPreviewContainer>
        </InvoiceGridContainer>
      </PageContent>
    </PageContainer>
  );
}

function usePaymentFormSubmission(schoolId: string, yearId: string) {
  const addInvoice = useInvoiceStore((state) => state.addInvoice);
  const resetForm = useFastPaymentStore((store) => store.resetSelections);

  return useProcessStudentPaymentForm({
    schoolId,
    yearId,
    mutationKey: ["fin"],
    onSuccess({ payment }) {
      addInvoice({
        date: payment.createdAt,
        id: payment.paymentId,
        invoiceRef: payment.transactionReference || "no-ref",
        isPrinted: false,
        type: "payment",
      });
      resetForm();
    },
  });
}

/**
 * Renders and handles student payment checkout form logic.
 * @returns The payment form section element.
 */
export function PaymentForm(): React.JSX.Element {
  const { schoolId = "", yearId = "" } = useCurrentConfig();
  const form = usePaymentFormSubmission(schoolId, yearId);

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
