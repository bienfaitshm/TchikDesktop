import React from "react";
import { TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";
import { CardContent } from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import {
  useCreateDailyExchangeRateForm,
  useGetLatestDailyExchangeRate,
} from "@/renderer/libs/queries/finances";
import { formatRelativeTime } from "@/packages/times";
import { DailyExchangeSyncForm } from "../forms/daily-exchange-sync-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";

type DailySyncProps = { schoolId: string };

const DailySync: React.FC<DailySyncProps> = ({ schoolId }) => {
  const {
    data: dailyExChangeRate = null,
    isLoading,
    queryKey,
  } = useGetLatestDailyExchangeRate({
    where: { dailyExchangeRates: { schoolId } },
  });
  const { formId, isSubmitting, onSubmit } = useCreateDailyExchangeRateForm({
    mutationKey: queryKey,
  });

  const currencyFrom = dailyExChangeRate?.currencyFrom ?? "USD";
  const currencyTo = dailyExChangeRate?.currencyTo ?? "CDF";
  const rate = dailyExChangeRate?.rate ?? "---";

  return (
    <div className="py-4 px-2">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-base font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp data-icon="inline-start" className="text-primary" />
            Taux de Référence Interne
          </h1>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Définit le taux de conversion global appliqué aux encaissements en
            CDF pour les frais structurés en USD.
          </p>
        </div>

        <CardContent className="flex flex-col gap-5 p-0">
          {/* Visualisation du Taux Actuel */}
          <div className="bg-muted/30 border border-border/60 rounded-xl p-4 text-center flex flex-col gap-2">
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
            <div>
              <Badge
                variant="secondary"
                className="text-[10px] font-medium px-2 py-0.5 bg-background border border-border"
              >
                {dailyExChangeRate
                  ? formatRelativeTime(dailyExChangeRate.date)
                  : "Mis à jour récemment"}
              </Badge>
            </div>
          </div>

          {/* Formulaire d'ajustement */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Mise à jour du taux
            </label>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <DailyExchangeSyncForm
                  formId={formId}
                  defaultValues={{ schoolId }}
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
                  className={isSubmitting ? "animate-spin" : ""}
                  data-icon="inline-start"
                />
                Mettre à jour
              </Button>
            </div>
          </div>

          {/* Message d'avertissement UX optimisé */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg flex gap-2.5 text-xs leading-relaxed">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
            <p>
              <strong className="font-semibold">Attention :</strong> Ce nouveau
              taux sera appliqué immédiatement aux prochains paiements. Les
              transactions déjà enregistrées restent inchangées.
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export interface DailyExchangeProps extends DailySyncProps {}

export function DailyExchange({ schoolId }: DailyExchangeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <TrendingUp data-icon="inline-start" />
          Taux de conversion
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-md transition-all animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200">
        <Suspense
          fallback={
            <div className="min-h-36 flex justify-center items-center">
              <LoadingSpinner />
            </div>
          }
        >
          <DailySync schoolId={schoolId} />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}
