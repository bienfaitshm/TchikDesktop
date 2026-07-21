import { Plus } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { useGetFeeConfigurations } from "@/renderer/libs/queries/finances";
import { FeeConfigTable } from "../tables/fee-config-table";
import { FeeConfigurationDialogCreateForm } from "../dialog";
import { DailyExchange } from "../components/daily-exchange";

export function SchoolPaymentConfigPage() {
  const { schoolId, yearId } = useSchoolContext();
  const { data: feeConfigs = [], queryKey: mutationKey } =
    useGetFeeConfigurations({
      where: {
        feeConfigurations: {
          schoolId: { $eq: schoolId },
          yearId: { $eq: yearId },
        },
      },
    });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-8 container mx-auto space-y-8 antialiased">
      {/* Header de la Page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Configurations Financières
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez la politique monétaire interne de l'établissement et
            structurez les types de frais scolaires.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DailyExchange schoolId={schoolId} />
          <FeeConfigurationDialogCreateForm
            mutationKey={mutationKey}
            schoolId={schoolId}
            yearId={yearId}
          >
            <Button size="sm" className="shadow-xs gap-2 font-medium">
              <Plus className="w-4 h-4" />
              Nouvelle Configuration
            </Button>
          </FeeConfigurationDialogCreateForm>
        </div>
      </div>

      {/* Grille principale */}
      <div className="mt-4">
        <FeeConfigTable
          schoolId={schoolId}
          yearId={yearId}
          feeConfigurations={feeConfigs}
          mutationKey={mutationKey}
        />
      </div>
    </div>
  );
}
