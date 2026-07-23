import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  WalletCards,
  Receipt,
  Landmark,
  Plus,
  Coins,
  Settings,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent } from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/renderer/components/ui/toggle-group";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Link } from "react-router";
import { APP_ROUTES } from "@/renderer/constants";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useGetFinancialDashboardData } from "@/renderer/libs/queries/dashboard/dashboard";
import { formatCurrency } from "@/packages/currency";

export function SchoolFinanceDashboard() {
  const { schoolId, yearId } = useCurrentConfig();
  const { data, isLoading } = useGetFinancialDashboardData({
    schoolId,
    yearId,
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Aperçu Financier
              </h1>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium shadow-sm self-start sm:self-auto"
              >
                <Coins className="w-4 h-4" /> Encaisser un Paiement
              </Button>
            </div>

            {/* Header Graphique */}
            <div className="flex justify-between items-end flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-bold text-foreground">
                    {formatCurrency(kpis.totalCollected, "USD")}
                  </h2>
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-0.5 text-xs font-semibold">
                    Global
                  </Badge>
                </div>
                <p className="text-lg font-medium text-muted-foreground mt-1">
                  Total encaissé global
                </p>
              </div>
            </div>

            {/* Graphique des Revenus */}
            <div className="bg-card rounded-xl p-4 h-88 border border-border shadow-sm">
              {revenueChart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Aucune donnée de paiement disponible pour la période.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={true}
                      horizontal={true}
                      stroke="var(--color-border)"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="dateString"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--color-muted-foreground)",
                        fontSize: 12,
                      }}
                      tickMargin={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--color-muted-foreground)",
                        fontSize: 12,
                      }}
                      tickFormatter={(value) => `$${value}`}
                      domain={["auto", "auto"]}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-popover)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-popover-foreground)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      itemStyle={{
                        color: "var(--color-foreground)",
                        fontWeight: 500,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="collected"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      dot={false}
                      name="Encaissé"
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        stroke: "var(--color-background)",
                        fill: "var(--color-primary)",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Contrôles du graphique */}
              <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
                <ToggleGroup
                  type="single"
                  defaultValue="30d"
                  variant="outline"
                  className="p-1 rounded-lg bg-muted/50 border border-border"
                >
                  <ToggleGroupItem
                    value="7d"
                    className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground rounded-md border-0"
                  >
                    7J
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="30d"
                    className="text-xs px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md border-0"
                  >
                    30J
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="year"
                    className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground rounded-md border-0"
                  >
                    Année
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Suivi par Classe */}
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-foreground tracking-tight">
                    Performance de Recouvrement par Classe
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pourcentage de perception des frais par salle de classe.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classroomPerformance.map((item) => {
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
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Trésorerie
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-9 h-9 border-border shadow-sm"
                  title="Ajouter une configuration"
                >
                  <Plus className="w-4 h-4 text-foreground" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-9 h-9 border-border shadow-sm"
                  title="Ajuster les taux"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
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
                  <p className="text-lg font-bold text-foreground mt-2">
                    {formatCurrency(kpis.totalExpected, "USD")}
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
                  <p className="text-lg font-bold text-background mt-2">
                    {formatCurrency(kpis.totalCollected, "USD")}
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
              <div className="space-y-3">
                {recentPayments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    Aucun paiement récent enregistré.
                  </p>
                ) : (
                  recentPayments.map((payment) => (
                    <div
                      key={payment.paymentId}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors -mx-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-xs font-bold text-foreground shadow-xs">
                          {payment.studentName
                            ? payment.studentName[0].toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground leading-snug">
                            {payment.studentName}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {payment.feeTypeName} •{" "}
                            <span className="text-primary font-medium">
                              {payment.classroomName}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-foreground whitespace-nowrap">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {payment.reference || payment.method}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
