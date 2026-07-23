import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { FastPaymentForm } from "../forms/fast-payment";
import { useProcessStudentPaymentForm } from "@/renderer/libs/queries/finances";
import {
  PageContainer,
  PageContent,
  PageHeadTitle,
  PageHeadDescription,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";

export function FastPaymentPage() {
  const { schoolId, yearId, school } = useCurrentConfig();

  const {
    currencyOptions,
    formId,
    isSubmitting,
    onSubmit,
    paymentMethodOptions,
  } = useProcessStudentPaymentForm({
    schoolId: schoolId as string,
    yearId: yearId as string,
  });

  return (
    <PageContainer className="space-y-4">
      <PageHeader className="pt-10">
        <PageHeaderTextContent>
          <PageHeadTitle>Terminal de Caisse</PageHeadTitle>
          <PageHeadDescription>
            Saisie rapide des encaissements physiques au guichet et édition
            instantanée des reçus d'écolage.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent className="mt-4">
        <FastPaymentForm
          school={school}
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
