import React from "react";
import { TrendingUp, RefreshCw, AlertTriangle, Plus } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import {
  useCreateDailyExchangeRateForm,
  useGetFeeConfigurations,
  useGetLatestDailyExchangeRate,
} from "@/renderer/libs/queries/finances";
import { formatRelativeTime } from "@/packages/times";
import { FeeConfigTable } from "../tables/fee-config-table";
import { FeeConfigurationDialogCreateForm } from "../dialog";
import { DailyExchangeSyncForm } from "../forms/daily-exchange-sync-form";

type DailySyncProps = { schoolId: string };

const DailySync: React.FC<DailySyncProps> = ({ schoolId }) => {
  const {
    data: dailyExChangeRate = null,
    isLoading,
    queryKey,
  } = useGetLatestDailyExchangeRate({
    where: { schoolId },
  });
  const { formId, isSubmitting, onSubmit } = useCreateDailyExchangeRateForm({
    mutationKey: queryKey,
  });

  const currencyFrom = dailyExChangeRate?.currencyFrom ?? "USD";
  const currencyTo = dailyExChangeRate?.currencyTo ?? "CDF";
  const rate = dailyExChangeRate?.rate ?? "---";

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            Taux de Référence Interne
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            Définit le taux de conversion global appliqué aux encaissements en
            CDF pour les frais structurés en USD.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Visualisation du Taux Actuel */}
          <div className="bg-muted/30 border border-border/60 rounded-xl p-4 text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Taux Actuel Appliqué
            </span>
            <div className="text-2xl font-mono font-bold text-foreground tracking-tight">
              {isLoading ? (
                <span className="text-muted-foreground animate-pulse">
                  Chargement...
                </span>
              ) : (
                <>
                  1 {currencyFrom} = {rate} {currencyTo}
                </>
              )}
            </div>
            <Badge
              variant="secondary"
              className="text-[10px] font-medium px-2 py-0.5 bg-background border border-border"
            >
              {dailyExChangeRate
                ? formatRelativeTime(dailyExChangeRate.date)
                : "Mis à jour récemment"}
            </Badge>
          </div>

          {/* Formulaire d'ajustement */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Mise à jour du taux
            </label>
            {/* items-start assure la cohérence visuelle si un message d'erreur Zod apparaît en dessous de l'input */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <DailyExchangeSyncForm
                  defaultValues={{ schoolId }}
                  formId={formId}
                  onSubmit={onSubmit}
                />
              </div>
              <Button
                form={formId}
                type="submit"
                variant="default"
                size="sm"
                className="h-9 px-3 gap-1.5 shrink-0"
                disabled={isSubmitting || isLoading}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`}
                />
                Mettre à jour
              </Button>
            </div>
          </div>

          {/* Message d'avertissement UX optimisé */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg flex gap-2.5 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
            <p>
              <strong className="font-semibold">Attention :</strong> Ce nouveau
              taux sera appliqué immédiatement aux prochains paiements. Les
              transactions déjà enregistrées restent inchangées.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function SchoolPaymentConfigPage() {
  const { schoolId, yearId } = useSchoolContext();
  const { data: feeConfigs = [], queryKey: mutationKey } =
    useGetFeeConfigurations({ where: { schoolId, yearId } });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-8 container mx-auto space-y-8 antialiased">
      {/* Header de la Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Configurations Financières
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez la politique monétaire interne de l'établissement et
            structurez les types de frais scolaires.
          </p>
        </div>
        <FeeConfigurationDialogCreateForm schoolId={schoolId} yearId={yearId}>
          <Button size="sm" className="shadow-xs gap-2 font-medium">
            <Plus className="w-4 h-4" />
            Nouvelle Configuration
          </Button>
        </FeeConfigurationDialogCreateForm>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <FeeConfigTable
            schoolId={schoolId}
            feeConfigurations={feeConfigs}
            mutationKey={mutationKey}
          />
        </div>
        <DailySync schoolId={schoolId} />
      </div>
    </div>
  );
}
