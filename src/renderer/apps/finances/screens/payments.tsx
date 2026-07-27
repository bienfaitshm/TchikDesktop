"use client";

import { useCallback } from "react";
import { Link } from "react-router";
import { HistoryIcon, Table2Icon } from "lucide-react";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import {
  usePrintTicketForm,
  useProcessStudentPaymentForm,
} from "@/renderer/libs/queries/finances";
import {
  FastPaymentForm,
  InvoiceLivePreview,
  FastPaymentContainer,
  FastPaymentFormContainer,
  FastPaymentPreviewContainer,
  type Ticket,
} from "@/renderer/apps/finances/forms/fast-payment";
import { PaymentHistoryDialog } from "@/renderer/apps/finances/dialog/payment-history-dialog";
import { Button } from "@/renderer/components/ui/button";
import {
  PageContainer,
  PageContent,
  PageHeadTitle,
  PageHeadDescription,
  PageHeader,
  PageHeaderTextContent,
  PageHeadAction,
} from "@/renderer/containers/page-container";
import { APP_ROUTES } from "@/renderer/constants";
import { FormSubmitHandler } from "@/renderer/libs/queries/base";

/**
 * Point-of-sale terminal page component for processing student payments.
 * Integrates checkout form management, live ticket previews, and navigation shortcuts.
 *
 * @returns The fast payment page view element.
 */
export function FastPaymentPage() {
  const { schoolId = "", yearId = "", school, year } = useCurrentConfig();
  const printTicket = usePrintTicketForm();

  const {
    currencyOptions,
    formId,
    isSubmitting,
    onSubmit,
    paymentMethodOptions,
  } = useProcessStudentPaymentForm(
    {
      schoolId,
      yearId,
    },
    { process: "fast" },
  );

  const handlePrintTicket: FormSubmitHandler<Ticket, any> = useCallback(
    (_payload, helpers) => {
      console.log("handlePrintTicket", _payload);
      printTicket.onSubmit(_payload, {
        reset() {
          helpers.reset();
        },
      });
    },
    [],
  );

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
        <FastPaymentContainer>
          <FastPaymentFormContainer>
            <FastPaymentForm
              yearName={year?.yearName!}
              school={school!}
              formId={formId}
              isSubmitting={isSubmitting}
              schoolId={schoolId}
              yearId={yearId}
              onSubmit={onSubmit}
              currencyOptions={currencyOptions}
              paymentMethodOptions={paymentMethodOptions}
            />
          </FastPaymentFormContainer>
          <FastPaymentPreviewContainer>
            <InvoiceLivePreview school={school!} onPrint={handlePrintTicket} />
          </FastPaymentPreviewContainer>
        </FastPaymentContainer>
      </PageContent>
    </PageContainer>
  );
}
