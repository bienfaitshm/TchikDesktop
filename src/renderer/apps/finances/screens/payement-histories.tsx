import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Coins,
  Printer,
  Filter,
  CalendarDays,
  Download,
  FileText,
} from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Badge } from "@/renderer/components/ui/badge";
import { Card, CardContent } from "@/renderer/components/ui/card";
import { useGetStudentPayments } from "@/renderer/libs/queries/finances";

// Objet de routage global
const FIN = {
  DASHBOARD: "/dashboard",
};

// Tes données factices d'historique (Reflet direct de student_payments)
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

export function PaymentsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<
    "ALL" | "USD" | "CDF"
  >("ALL");

  // Filtrage pro des données côté client
  const filteredPayments = recentPaymentsData.filter((payment) => {
    const matchesSearch =
      payment.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCurrency =
      selectedCurrency === "ALL" || payment.currency === selectedCurrency;
    return matchesSearch && matchesCurrency;
  });

  const { data: payments = [] } = useGetStudentPayments({ where: {} });

  return (
    <div className="min-h-screen font-sans bg-background text-foreground p-6 lg:p-8 container mx-auto space-y-8">
      {/* En-tête de page & Lien de retour */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <a
            href={FIN.DASHBOARD}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour au Tableau de Bord
          </a>
          <h1 className="text-3xl font-bold tracking-tight">
            Historique des Reçus
          </h1>
          <p className="text-sm text-muted-foreground">
            Registre complet des pièces comptables et paiements effectués par
            les élèves.
          </p>
        </div>

        {/* Actions utilitaires de comptabilité */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium h-9"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer le journal
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium h-9"
          >
            <Download className="w-3.5 h-3.5" /> Exporter Excel
          </Button>
        </div>
      </div>

      {/* Barre d'outils de filtrage sémantique (UX simplifiée) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-card p-4 border border-border rounded-xl shadow-xs">
        {/* Champ de recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom d'élève ou numéro de référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full bg-background border border-border rounded-lg h-9 px-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
          />
        </div>

        {/* Boutons de filtres par devises */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline mr-1">
            Devise :
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-muted/50 border border-border rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedCurrency("ALL")}
              className={`px-3 py-1 rounded-md transition-all ${selectedCurrency === "ALL" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedCurrency("USD")}
              className={`px-3 py-1 rounded-md transition-all ${selectedCurrency === "USD" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              USD
            </button>
            <button
              onClick={() => setSelectedCurrency("CDF")}
              className={`px-3 py-1 rounded-md transition-all ${selectedCurrency === "CDF" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              CDF
            </button>
          </div>
        </div>
      </div>

      {/* Liste principale calquée sur ton arborescence HTML et tes classes CSS */}
      <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Transactions Enregistrées ({filteredPayments.length})
          </span>
        </div>

        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/40 transition-colors gap-3"
                >
                  {/* Partie Gauche : Identité de l'élève & Type de frais */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-xs font-bold text-foreground shadow-xs shrink-0">
                      {payment.student[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-snug">
                        {payment.student}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {payment.feeType} •{" "}
                        <span className="text-primary font-medium">
                          {payment.classroom}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Partie Droite : Financier & Méthode de paiement */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-sm text-foreground whitespace-nowrap">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        Réf: {payment.reference}
                      </p>
                    </div>

                    {/* Badge sémantique lié au canal d'encaissement */}
                    <Badge
                      variant="secondary"
                      className="h-6 px-2.5 text-[10px] bg-secondary text-secondary-foreground border border-border/60 font-medium"
                    >
                      {payment.method}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-sm text-muted-foreground space-y-2">
                <Coins className="w-8 h-8 mx-auto text-muted-foreground/60 animate-bounce" />
                <p className="font-medium">
                  Aucun reçu de paiement ne correspond à vos critères.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
