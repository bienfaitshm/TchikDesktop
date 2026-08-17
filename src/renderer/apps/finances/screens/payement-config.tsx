import { Plus } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { useGetFeeConfigurations } from "@/renderer/libs/queries/finances";
import { FeeConfigTable } from "../tables/fee-config-table";
import { FeeConfigurationDialogCreateForm } from "../dialog";
import { DailyExchange } from "../components/daily-exchange";
import {
  PageContainer,
  PageContent,
  PageHeadAction,
  PageHeadTitle,
  PageHeader,
  PageHeadDescription,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";

export function SchoolPaymentConfigPage() {
  const { schoolId, yearId } = useSchoolContext();
  const { data: feeConfigs = [], queryKey: mutationKey } =
    useGetFeeConfigurations({
      where: {
        feeConfigurations: {
          schoolId,
          yearId,
        },
      },
    });

  return (
    <PageContainer>
      <PageHeader className="border-b">
        <PageHeaderTextContent>
          <PageHeadTitle>Configurations Financières</PageHeadTitle>
          <PageHeadDescription>
            {" "}
            Gérez la politique monétaire interne de l'établissement et
            structurez les types de frais scolaires.
          </PageHeadDescription>
        </PageHeaderTextContent>
        <PageHeadAction>
          <DailyExchange schoolId={schoolId} />
          <FeeConfigurationDialogCreateForm
            mutationKey={mutationKey}
            schoolId={schoolId}
            yearId={yearId}
            defaultValues={{ schoolId, yearId }}
          >
            <Button size="sm" className="shadow-xs gap-2 font-medium">
              <Plus className="w-4 h-4" />
              Nouvelle Configuration
            </Button>
          </FeeConfigurationDialogCreateForm>
        </PageHeadAction>
      </PageHeader>
      <PageContent>
        <FeeConfigTable
          schoolId={schoolId}
          yearId={yearId}
          feeConfigurations={feeConfigs}
          mutationKey={mutationKey}
        />
      </PageContent>
    </PageContainer>
  );
}
