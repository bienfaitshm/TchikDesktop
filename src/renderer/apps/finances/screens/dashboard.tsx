import { WalletCards, Receipt, Landmark, Layers, Loader2 } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent } from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Link } from "react-router";
import { APP_ROUTES } from "@/renderer/constants";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useGetFinancialDashboardData } from "@/renderer/libs/queries/dashboard/dashboard";
import { formatCurrency } from "@/packages/currency";
import { RecentPaymentView } from "../components/recent-payment-view";
import { RevenueChart } from "../components/revenu-chart";

export function SchoolFinanceDashboard() {
  const { schoolId, yearId } = useCurrentConfig();
  const { data, isLoading } = useGetFinancialDashboardData({
    schoolId: schoolId!,
    yearId: yearId!,
  });

  // Déstructuration sécurisée avec données de repli
  const kpis = data?.kpis ?? { totalExpected: 0, totalCollected: 0 };
  const revenueChart = data?.revenueChart ?? [];
  const recentPayments = data?.recentPayments ?? [];
  const classroomPerformance = data?.classroomPerformance ?? [];
  const feeTypeCollectionRates = data?.feeTypeCollectionRates ?? [];

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 font-medium">
          Chargement du tableau de bord...
        </span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full flex-1">
      <main className="p-6 lg:p-8 min-h-screen container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* --- COLONNE GAUCHE (Graphique & Performance par classe) --- */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header Graphique */}
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl text-foreground tracking-tight">
                Aperçu Financier
              </h3>
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {formatCurrency(kpis.totalCollected, kpis.currency)}
                  </h2>
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-0.5 text-xs font-semibold">
                    Global
                  </Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  Total encaissé global
                </p>
              </div>
            </div>

            {/* Graphique des Revenus */}
            <RevenueChart revenueChart={revenueChart} />

            {/* Suivi par Classe */}
            <div className="pt-10 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-foreground tracking-tight">
                    Performance de Recouvrement par Classe
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pourcentage de perception des frais par salle de classe.
                  </p>
                </div>
                <Button
                  variant="link"
                  className="text-xs text-primary h-auto p-0 hover:text-primary/80"
                >
                  Voir tout
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classroomPerformance.slice(0, 4).map((item) => {
                  const paidPercentage =
                    item.totalExpected > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (item.totalPaid / item.totalExpected) * 100,
                          ),
                        )
                      : 0;

                  return (
                    <div
                      key={item.classroomName}
                      className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center border border-border">
                            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <h4 className="text-sm font-semibold text-foreground leading-tight">
                            {item.classroomName}
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {item.totalStudents} Élèves
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span>Progression</span>
                          <span className="font-mono">{paidPercentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/20">
                          <div
                            className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${paidPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --- COLONNE DROITE (Trésorerie, Derniers Paiements & Types de Frais) --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-foreground tracking-tight">
                Trésorerie
              </h3>
            </div>

            {/* Cartes Récapitulatives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              <Card className="bg-muted border border-border shadow-sm rounded-2xl">
                <CardContent className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="bg-background w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm border border-border/50">
                      <WalletCards className="w-4 h-4 text-foreground" />
                    </div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Frais Attendus
                    </p>
                  </div>
                  <p className="text-md font-bold text-foreground mt-2">
                    {formatCurrency(kpis.totalExpected, kpis.currency)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-foreground border-0 shadow-md rounded-2xl text-background">
                <CardContent className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="bg-background/20 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                      <Landmark className="w-4 h-4 text-background" />
                    </div>
                    <p className="text-[11px] uppercase tracking-wider text-background/70 font-semibold">
                      Total Encaissé
                    </p>
                  </div>
                  <p className="text-md font-bold text-background mt-2">
                    {formatCurrency(kpis.totalCollected, kpis.currency)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Historique des paiements récents */}
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-foreground">
                  Derniers Paiements
                </h3>
                <Link to={APP_ROUTES.FIN.PAYMENTS.HISTORIES}>
                  <Button
                    variant="link"
                    className="text-xs text-primary h-auto p-0 hover:text-primary/80"
                  >
                    Voir tout
                  </Button>
                </Link>
              </div>
              <RecentPaymentView
                payments={recentPayments}
                formatData={(payment) => payment}
              />
            </div>

            {/* Taux de Recouvrement par Type de Frais */}
            <div className="pt-6 border-t border-border">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg text-foreground">
                  Types de Frais
                </h3>
              </div>

              <div className="space-y-5">
                {feeTypeCollectionRates.map((item) => {
                  const paidPercent =
                    item.totalExpected > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (item.totalPaid / item.totalExpected) * 100,
                          ),
                        )
                      : 0;

                  return (
                    <div
                      key={item.feeTypeName}
                      className="flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground border border-border">
                        <Receipt className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-sm font-medium w-28 truncate text-foreground">
                          {item.feeTypeName}
                        </span>
                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden flex border border-border/50">
                          <div
                            className="bg-primary h-full transition-all duration-500 ease-out"
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center w-10 justify-end">
                          <span className="text-sm font-bold text-foreground">
                            {paidPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ScrollArea>
  );
}
