"use client";

import { Link } from "react-router";
import { HistoryIcon, UsersIcon } from "lucide-react";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useProcessStudentPaymentForm } from "@/renderer/libs/queries/finances";
import { FastPaymentForm } from "@/renderer/apps/finances/forms/fast-payment";
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

/**
 * Main layout component for the POS counter terminal.
 * Coordinates global app configurations and orchestrates the fast payment workflow.
 * @returns The rendered fast payment page UI.
 */
export function FastPaymentPage() {
  const { schoolId = "", yearId = "", school } = useCurrentConfig();

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

  return (
    <PageContainer className="flex flex-col gap-6 mt-10">
      <PageHeader className="border-b pb-5">
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
              <UsersIcon data-icon="inline-start" />
              Liste des élèves
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
        <FastPaymentForm
          school={school!}
          formId={formId}
          isSubmitting={isSubmitting}
          schoolId={schoolId}
          yearId={yearId}
          onSubmit={onSubmit}
          currencyOptions={currencyOptions}
          paymentMethodOptions={paymentMethodOptions}
        />
      </PageContent>
    </PageContainer>
  );
}
