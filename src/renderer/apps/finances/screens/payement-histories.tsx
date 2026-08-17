"use client";
import { useGetStudentPayments } from "@/renderer/libs/queries/finances";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { PaymentTable } from "../tables/payement-history";
import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeader,
  PageHeaderTextContent,
  PageHeadTitle,
} from "@/renderer/containers/page-container";

export function PaymentsHistoryPage() {
  const { schoolId, yearId } = useCurrentConfig();
  const { data: payments = [] } = useGetStudentPayments({
    where: {
      studentPayments: {
        schoolId,
        yearId,
      },
    },
    limit: 50,
  });

  return (
    <PageContainer>
      <PageHeader className="border-b">
        <PageHeaderTextContent>
          <PageHeadTitle> Historique des Reçus</PageHeadTitle>
          <PageHeadDescription>
            Registre complet des pièces comptables et paiements effectués par
            les élèves.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent>
        <PaymentTable payments={payments} />
      </PageContent>
    </PageContainer>
  );
}
