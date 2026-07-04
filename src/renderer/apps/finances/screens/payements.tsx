import React from "react";
import {
  Coins,
  ArrowLeft,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Badge } from "@/renderer/components/ui/badge";

const FIN = { DASHBOARD: "/dashboard" };

const allPayments = [
  {
    id: "P-10023",
    student: "Alice Mutombo",
    class: "3ème Primaire A",
    amount: "150 USD",
    fee: "Minerval T2",
    date: "04/07/2026",
    method: "M-Pesa",
    status: "Validé",
  },
  {
    id: "P-10022",
    student: "David Kasongo",
    class: "1ère Secondaire B",
    amount: "85,500 CDF",
    fee: "Frais État",
    date: "04/07/2026",
    method: "Cash",
    status: "Validé",
  },
  {
    id: "P-10021",
    student: "Sarah Ilunga",
    class: "6ème Primaire B",
    amount: "50 USD",
    fee: "Transport",
    date: "03/07/2026",
    method: "Banque",
    status: "Validé",
  },
];

export function PaymentsJournalPage() {
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
            Journal des Paiements
          </h1>
          <p className="text-sm text-muted-foreground">
            Registre global des perceptions et entrées de fonds.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" /> Encaisser un Paiement
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-3 justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un élève ou un reçu..."
              className="pl-9 w-full bg-background border border-border rounded-lg h-9 text-sm focus:outline-hidden"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5" /> Filtrer
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">ID Reçu</th>
                <th className="p-4">Élève</th>
                <th className="p-4">Classe</th>
                <th className="p-4">Type de Frais</th>
                <th className="p-4">Date</th>
                <th className="p-4">Canal</th>
                <th className="p-4">Montant</th>
                <th className="p-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {allPayments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-primary">
                    {p.id}
                  </td>
                  <td className="p-4 font-semibold text-foreground">
                    {p.student}
                  </td>
                  <td className="p-4 text-muted-foreground">{p.class}</td>
                  <td className="p-4 font-medium">{p.fee}</td>
                  <td className="p-4 text-xs font-mono">{p.date}</td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-medium"
                    >
                      {p.method}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono font-bold text-foreground">
                    {p.amount}
                  </td>
                  <td className="p-4 text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 font-semibold px-2 py-0.5">
                      Approved
                    </Badge>
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
