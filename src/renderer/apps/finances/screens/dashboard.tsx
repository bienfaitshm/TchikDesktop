import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  WalletCards,
  Receipt,
  TrendingUp,
  Landmark,
  Plus,
  Coins,
  Settings,
  Layers,
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

// --- Données factices basées sur ta DB (studentPayments) ---
const revenueChartData = [
  { date: "1 Fév", collected: 1200, expectedTrend: 1500 },
  { date: "2 Fév", collected: 2100, expectedTrend: 1800 },
  { date: "3 Fév", collected: 1800, expectedTrend: 2200 },
  { date: "4 Fév", collected: 3200, expectedTrend: 2500 },
  { date: "5 Fév", collected: 2900, opacity: 3100 },
  { date: "6 Fév", collected: 4100, expectedTrend: 3500 },
  { date: "7 Fév", collected: 3800, expectedTrend: 4200 },
  { date: "8 Fév", collected: 5200, expectedTrend: 4800 },
  { date: "9 Fév", collected: 4900, expectedTrend: 5100 },
  { date: "10 Fév", collected: 6150, expectedTrend: 5500 },
];

// --- Données factices basées sur (studentPayments & feeAssignments) ---
const recentPaymentsData = [
  {
    student: "Alice Mutombo",
    classroom: "3ème Primaire A",
    amount: 150,
    currency: "USD",
    feeType: "Minerval - Trimestre 2",
    method: "M-Pesa",
    reference: "MP-9843A",
  },
  {
    student: "David Kasongo",
    classroom: "1ère Secondaire B",
    amount: 85500,
    currency: "CDF",
    feeType: "Frais de l'État",
    method: "Cash",
    reference: "RECU-1024",
  },
  {
    student: "Sarah Ilunga",
    classroom: "6ème Primaire B",
    amount: 50,
    currency: "USD",
    feeType: "Transport - Février",
    method: "Banque",
    reference: "BK-TR001",
  },
];

// --- Données factices basées sur (feeAssignments groupé par classrooms) ---
const classroomCollectionData = [
  { name: "3ème Primaire A", paid: 78, total: "32 Élèves", status: "Minerval" },
  {
    name: "6ème Primaire B",
    paid: 45,
    total: "28 Élèves",
    status: "Transport",
  },
  {
    name: "1ère Secondaire B",
    paid: 92,
    total: "35 Élèves",
    status: "Frais État",
  },
  { name: "Maternelle C", paid: 30, total: "20 Élèves", status: "Cantine" },
];

// --- Données factices basées sur (fee_types) ---
const feeTypesData = [
  {
    name: "Minerval (Frais Scolaires)",
    amount: "$150 / Trimestre",
    target: "Caisse Principale",
  },
  {
    name: "Transport Scolaire",
    amount: "45,000 CDF / Mois",
    target: "Caisse Ligne Bus",
  },
  {
    name: "Frais de l'État & Éxamens",
    amount: "$25 / Session",
    target: "Frais Annexes",
  },
];

// --- Données factices basées sur (studentPayments & feeAssignments) ---
// const recentPaymentsData = [
//   {
//     student: "Alice Mutombo",
//     classroom: "3ème Primaire A",
//     amount: 150,
//     currency: "USD",
//     feeType: "Minerval - Trimestre 2",
//     method: "M-Pesa",
//     reference: "MP-9843A",
//   },
//   {
//     student: "David Kasongo",
//     classroom: "1ère Secondaire B",
//     amount: 85500,
//     currency: "CDF",
//     feeType: "Frais de l'État",
//     method: "Cash",
//     reference: "RECU-1024",
//   },
//   {
//     student: "Sarah Ilunga",
//     classroom: "6ème Primaire",
//     amount: 50,
//     currency: "USD",
//     feeType: "Transport - Février",
//     method: "Banque",
//     reference: "BK-TR001",
//   },
// ];

// --- Données factices basées sur (feeAssignments groupé par feeTypes) ---
const collectionRatesData = [
  { name: "Minerval", paid: 78, unpaid: 22 },
  { name: "Transport", paid: 45, unpaid: 55 },
  { name: "Frais de l'État", paid: 92, unpaid: 8 },
  { name: "Cantine", paid: 30, unpaid: 70 },
];

export function SchoolFinanceDashboard() {
  const [exchangeRate, setExchangeRate] = useState(2850);

  return (
    <ScrollArea className="h-full flex-1">
      {/* --- Contenu Principal --- */}
      <main className="p-6 lg:p-8 min-h-screen container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* --- COLONNE GAUCHE (Graphique & Suivi par Classe en dessous) --- */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Aperçu Financier
              </h1>
              {/* UX Action Directe */}
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
                    $24,850.00
                  </h2>
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-0.5 text-xs font-semibold">
                    + 12.5% ce mois
                  </Badge>
                </div>
                <p className="text-lg font-medium text-muted-foreground mt-1">
                  Total encaissé global
                </p>
              </div>
            </div>

            {/* Composant Graphique */}
            <div className="bg-card rounded-xl p-4 h-[22rem] border border-border shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={true}
                    horizontal={true}
                    stroke="var(--color-border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
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
                  <Area
                    type="monotone"
                    dataKey="expectedTrend"
                    stroke="var(--color-muted-foreground)"
                    strokeDasharray="4 4"
                    fill="url(#gradientTrend)"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    name="Tendance attendue"
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
                  <defs>
                    <linearGradient
                      id="gradientTrend"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>

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
                    className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    7J
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="30d"
                    className="text-xs px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    30J
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="trim"
                    className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    Trimestre
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="year"
                    className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    Année
                  </ToggleGroupItem>
                </ToggleGroup>

                <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/50 border border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs bg-background shadow-sm font-medium text-foreground"
                  >
                    USD
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    CDF
                  </Button>
                </div>
              </div>
            </div>

            {/* --- AJOUT PRO UX : Suivi par Classe relocalisé sous le Graphique --- */}
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
                <div className="hidden sm:flex gap-4 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>{" "}
                    En Règle
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-muted rounded-full border border-border/50"></span>{" "}
                    En Attente
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classroomCollectionData.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center border border-border">
                          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.total}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-foreground">
                        <span>Progression</span>
                        <span className="font-mono">{item.paid}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/20">
                        <div
                          className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${item.paid}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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

            {/* Cartes Récapitulatives des Wallets */}
            <div className="space-y-4">
              {/* Cartes Récapitulatives des Wallets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-3">
                {/* Attendu Total */}
                <Card className="bg-muted border border-border shadow-sm rounded-2xl transition-colors hover:bg-muted/80">
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
                      $42,500
                    </p>
                  </CardContent>
                </Card>

                {/* Encaissé Total (Highlight) */}
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
                      $24,850
                    </p>
                  </CardContent>
                </Card>

                {/* Taux du jour (dailyExchangeRates) */}
                <Card className="bg-primary/10 border border-primary/20 shadow-sm rounded-2xl">
                  <CardContent className="p-4 flex flex-col h-full justify-between">
                    <div>
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm">
                        <TrendingUp className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <p className="text-[11px] uppercase tracking-wider text-primary/80 font-semibold">
                        Taux Fixé
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground mt-2 font-mono">
                      {exchangeRate.toLocaleString()} FC
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Historique des paiements (studentPayments) */}
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
                {recentPaymentsData.map((payment, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors -mx-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-xs font-bold text-foreground shadow-xs">
                        {payment.student[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground leading-snug">
                          {payment.student}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {payment.feeType} •{" "}
                          <span className="text-primary font-medium">
                            {payment.classroom}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-sm text-foreground whitespace-nowrap">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {payment.reference}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* État de Recouvrement (feeAssignments status) */}
            <div className="pt-6 border-t border-border">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg text-foreground">
                  Types de Frais
                </h3>
                <div className="flex gap-4 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>{" "}
                    Payé
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-muted-foreground/30 rounded-full"></span>{" "}
                    Impayé
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {collectionRatesData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground border border-border">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-sm font-medium w-28 truncate text-foreground">
                        {item.name}
                      </span>
                      {/* Barre de progression avec tes couleurs OKLCH */}
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden flex border border-border/50">
                        <div
                          className="bg-primary h-full transition-all duration-500 ease-out"
                          style={{ width: `${item.paid}%` }}
                        />
                        <div
                          className="bg-transparent h-full"
                          style={{ width: `${item.unpaid}%` }}
                        />
                      </div>
                      <div className="flex items-center w-10 justify-end">
                        <span className="text-sm font-bold text-foreground">
                          {item.paid}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ScrollArea>
  );
}
