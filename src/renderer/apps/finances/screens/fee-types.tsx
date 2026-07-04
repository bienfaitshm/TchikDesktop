import React from "react";
import {
  Receipt,
  Plus,
  Settings2,
  GraduationCap,
  Coins,
  Landmark,
  Calendar,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent } from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";

const FIN = {
  DASHBOARD: "/dashboard",
  FEE_TYPE: "/fin/fee-types",
  CLASSROOMS: "/fin/classrooms",
  PAYMENTS: "/fin/payments",
  EXCHANGE_RATES: "/fin/exchange-rates",
};

const feeTypesList = [
  {
    id: "f1",
    name: "Minerval - Trimestre 2",
    amount: 150,
    currency: "USD",
    period: "Trimestriel",
    target: "Compte Banque (Rawbank)",
    assigned: "450 Élèves",
  },
  {
    id: "f2",
    name: "Transport Ligne Bus",
    amount: 45000,
    currency: "CDF",
    period: "Mensuel",
    target: "Caisse Ligne Bus",
    assigned: "85 Élèves",
  },
  {
    id: "f3",
    name: "Frais de l'État & Éxamens",
    amount: 25,
    currency: "USD",
    period: "Session unique",
    target: "Frais Annexes",
    assigned: "120 Élèves",
  },
  {
    id: "f4",
    name: "Frais de Cantine",
    amount: 50,
    currency: "USD",
    period: "Mensuel",
    target: "Caisse Principale",
    assigned: "32 Élèves",
  },
];

export function FeeTypesPage() {
  return (
    <div className="min-h-screen font-sans bg-background text-foreground p-6 lg:p-8 container mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <a
            href={FIN.DASHBOARD}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour
          </a>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuration des Frais
          </h1>
          <p className="text-sm text-muted-foreground">
            Définissez et gérez les types de frais applicables aux élèves.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground gap-2 font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" /> Nouveau Type de Frais
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un frais..."
              className="pl-9 w-full bg-background border border-border rounded-lg h-9 text-sm focus:outline-hidden"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Libellé</th>
                <th className="p-4">Montant Exigé</th>
                <th className="p-4">Périodicité</th>
                <th className="p-4">Compte affecté</th>
                <th className="p-4">Élèves Assignés</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {feeTypesList.map((fee) => (
                <tr
                  key={fee.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 font-semibold text-foreground flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Receipt className="w-4 h-4" />
                    </div>
                    {fee.name}
                  </td>
                  <td className="p-4 font-mono font-bold text-foreground">
                    {fee.amount.toLocaleString()} {fee.currency}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs font-medium"
                    >
                      <Calendar className="w-3 h-3" /> {fee.period}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{fee.target}</td>
                  <td className="p-4 font-medium">{fee.assigned}</td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg"
                    >
                      <Settings2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
