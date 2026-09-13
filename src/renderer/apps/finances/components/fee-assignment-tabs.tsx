import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetFeeAssignments } from "@/renderer/libs/queries/finances";
import { groupFeeAssignmentsByTypeName } from "@/renderer/libs/queries/finances/utils";
import { formatCurrency } from "@/packages/currency";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export type FeeAssignmentTabProps = {
  enrollmentId: string;
};

export const FeeAssignmentTab: React.FC<FeeAssignmentTabProps> = ({
  enrollmentId,
}) => {
  const { data: assignments = [] } = useGetFeeAssignments({
    where: { feeAssignments: { enrollmentId } },
    orderBy: [{ table: "feeSchedules", column: "createdAt", order: "asc" }],
    limit: 5000,
  });

  const grouped = groupFeeAssignmentsByTypeName(assignments);

  if (grouped.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-2">
        Aucun frais configuré pour cet élève.
      </p>
    );
  }

  return (
    <Tabs defaultValue={grouped[0]?.heading} className="w-full">
      {/* Liste des Onglets épurée */}
      <TabsList className="bg-muted/50 p-1 rounded-lg gap-1 border border-border/40 w-full justify-start h-auto flex-wrap">
        {grouped.map((item) => (
          <TabsTrigger
            key={item.heading}
            value={item.heading!}
            className="text-xs px-3 py-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            {item.heading}
          </TabsTrigger>
        ))}
      </TabsList>

      {grouped.map((item) => {
        // Calcul du résumé du groupe (Total dû vs Total payé)
        const totalAmount = item.options.reduce(
          (acc, curr) => acc + curr.totalAmount,
          0,
        );
        const totalPaid = item.options.reduce(
          (acc, curr) => acc + curr.amountPaid,
          0,
        );
        const currency = item.options[0]?.currency || "CDF";
        const progressPercent =
          totalAmount > 0
            ? Math.min(100, Math.round((totalPaid / totalAmount) * 100))
            : 0;

        return (
          <TabsContent
            key={item.heading}
            value={item.heading!}
            className="mt-3 focus-visible:outline-none space-y-3"
          >
            {/* Résumé de progression financier */}
            <div className="bg-accent/30 rounded-lg p-2.5 border border-border/50 flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Progression :</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(totalPaid, currency)} /{" "}
                  {formatCurrency(totalAmount, currency)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] font-bold text-muted-foreground">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Grille compacte des cartes d'échéance */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {item.options.map((ass) => {
                const isPaid = ass.status === "PAID";
                const isPartial =
                  ass.amountPaid > 0 && ass.amountPaid < ass.totalAmount;

                return (
                  <div
                    key={ass.assignmentId}
                    className="p-2.5 rounded-lg border bg-card hover:border-border/80 transition-colors flex flex-col justify-between gap-1.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-semibold text-foreground line-clamp-1">
                        {ass.feeSchedule.installmentName}
                      </span>
                      {isPaid ? (
                        <CheckCircle
                          size={13}
                          className="text-emerald-500 shrink-0"
                        />
                      ) : isPartial ? (
                        <Clock size={13} className="text-amber-500 shrink-0" />
                      ) : (
                        <AlertCircle
                          size={13}
                          className="text-rose-500/70 shrink-0"
                        />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-mono font-bold text-foreground">
                        {formatCurrency(ass.amountPaid, ass.currency)}
                      </div>
                      {ass.amountPaid !== ass.totalAmount && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Sur {formatCurrency(ass.totalAmount, ass.currency)}
                        </div>
                      )}
                    </div>

                    {/* Badge compact de statut */}
                    <div className="pt-1 border-t border-border/40 flex items-center justify-between">
                      <span
                        className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isPartial
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isPaid ? "Payé" : isPartial ? "Partiel" : "Non payé"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
