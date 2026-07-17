"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Coins,
  Printer,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Badge } from "@/renderer/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/renderer/components/ui/card";
import { Separator } from "@/renderer/components/ui/separator";
import { Empty } from "@/renderer/components/ui/empty";
import { Field, FieldLabel } from "@/renderer/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/renderer/components/ui/input-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/renderer/components/ui/toggle-group";
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { useGetStudentPayments } from "@/renderer/libs/queries/finances";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { formatDate } from "@/packages/times";

// Objet de routage global
const FIN = {
  DASHBOARD: "/dashboard",
};

export function PaymentsHistoryPage() {
  const { schoolId, yearId } = useCurrentConfig();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<
    "ALL" | "USD" | "CDF"
  >("ALL");

  // Requête API réelle
  const { data: payments = [] } = useGetStudentPayments({
    where: { yearId, schoolId },
  });

  // Filtrage des données côté client basé sur les types réels
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionReference
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // Si vous liez les informations de l'étudiant via l'assignmentId ultérieurement :
      payment.assignmentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCurrency =
      selectedCurrency === "ALL" ||
      payment.currencyReceived === selectedCurrency;

    return matchesSearch && matchesCurrency;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-8 container mx-auto flex flex-col gap-8">
      {/* En-tête de page & Lien de retour */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Button
            variant="link"
            className="p-0 h-auto justify-start text-xs font-semibold text-muted-foreground hover:text-foreground mb-1"
            asChild
          >
            <a href={FIN.DASHBOARD}>
              <ArrowLeft data-icon="inline-start" /> Retour au Tableau de Bord
            </a>
          </Button>
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
            className="h-9"
            onClick={() => window.print()}
          >
            <Printer data-icon="inline-start" /> Imprimer le journal
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download data-icon="inline-start" /> Exporter Excel
          </Button>
        </div>
      </div>

      <Separator />

      {/* Barre d'outils de filtrage sémantique */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-card p-4 border border-border rounded-xl shadow-xs">
        {/* Champ de recherche avec InputGroup accessible */}
        <div className="flex-1 max-w-md">
          <Field>
            <FieldLabel htmlFor="search-receipts" className="sr-only">
              Rechercher un reçu
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Search className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="search-receipts"
                type="text"
                placeholder="Rechercher par référence ou ID de transaction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Field>
        </div>

        {/* Boutons de filtres par devises (Composant ToggleGroup sémantique) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">
            Devise :
          </span>
          <ToggleGroup
            type="single"
            value={selectedCurrency}
            onValueChange={(value) => {
              if (value) setSelectedCurrency(value as "ALL" | "USD" | "CDF");
            }}
            spacing={1}
            className="p-1 bg-muted/50 border border-border rounded-lg"
          >
            <ToggleGroupItem value="ALL" className="text-xs px-3 py-1 h-7">
              Toutes
            </ToggleGroupItem>
            <ToggleGroupItem value="USD" className="text-xs px-3 py-1 h-7">
              USD
            </ToggleGroupItem>
            <ToggleGroupItem value="CDF" className="text-xs px-3 py-1 h-7">
              CDF
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Liste principale des transactions */}
      <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center gap-2 space-y-0">
          <FileText className="text-primary" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Transactions Enregistrées ({filteredPayments.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => {
                const isUSD = payment.currencyReceived === "USD";

                return (
                  <div
                    key={payment.paymentId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/40 transition-colors gap-3"
                  >
                    {/* Partie Gauche : Métadonnées du paiement */}
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border shadow-xs">
                        <AvatarFallback className="text-xs font-bold">
                          {payment.paymentMethod
                            ? payment.paymentMethod[0].toUpperCase()
                            : "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-foreground leading-snug">
                          ID Affectation : {payment.assignmentId.slice(0, 8)}...
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Enregistré le{" "}
                          {formatDate(new Date(payment.createdAt))}
                          {payment.appliedExchangeRate && !isUSD && (
                            <span className="text-primary font-medium ml-1">
                              • Taux : {payment.appliedExchangeRate}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Partie Droite : Financier & Méthode de paiement */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-sm text-foreground whitespace-nowrap">
                          {payment.amountReceived.toLocaleString()}{" "}
                          {payment.currencyReceived}
                        </p>
                        {payment.transactionReference && (
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            Réf: {payment.transactionReference}
                          </p>
                        )}
                      </div>

                      {/* Badge sémantique lié au canal d'encaissement */}
                      <Badge
                        variant="secondary"
                        className="h-6 px-2.5 text-[10px] font-medium border border-border/60"
                      >
                        {payment.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty className="py-12">
                <Coins className="text-muted-foreground/60 animate-pulse" />
                <p className="font-medium mt-2 text-sm text-muted-foreground">
                  Aucun reçu de paiement ne correspond à vos critères.
                </p>
              </Empty>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
