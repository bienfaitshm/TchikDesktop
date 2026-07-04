import React, { useState } from "react";
import {
  WalletCards,
  Plus,
  Settings2,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Smartphone,
  Coins,
  Receipt,
  GraduationCap,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";

// Mock data des portefeuilles physiques/numériques de l'école
const walletAccountsData = [
  {
    id: 1,
    name: "Caisse Cash Centrale",
    balance: 4250,
    currency: "USD",
    type: "Cash",
    icon: Coins,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    id: 2,
    name: "Compte Banque (Rawbank)",
    balance: 18450,
    currency: "USD",
    type: "Banque",
    icon: Building2,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: 3,
    name: "Compte Mobile Money (M-Pesa)",
    balance: 6156000,
    currency: "CDF",
    type: "Mobile Money",
    icon: Smartphone,
    color: "text-red-500 bg-red-500/10",
  },
];

// Mock data des types de frais configurés (structure tarifaire)
const currentFeeTypes = [
  {
    id: "f1",
    name: "Minerval - Trimestre 2",
    amount: 150,
    currency: "USD",
    description: "Frais scolaires généraux obligatoires",
    targetWallet: "Compte Banque (Rawbank)",
  },
  {
    id: "f2",
    name: "Transport - Mensuel",
    amount: 25,
    currency: "USD",
    description: "Abonnement ligne de bus scolaire",
    targetWallet: "Caisse Cash Centrale",
  },
  {
    id: "f3",
    name: "Frais d'Examen d'État",
    amount: 85500,
    currency: "CDF",
    description: "Frais officiels fixés par la province",
    targetWallet: "Compte Mobile Money (M-Pesa)",
  },
  {
    id: "f4",
    name: "Cantine - Mensuel",
    amount: 45,
    currency: "USD",
    description: "Restauration midi optionnelle",
    targetWallet: "Caisse Cash Centrale",
  },
];

export function SchoolWalletPage() {
  return (
    <div className="min-h-screen font-sans bg-background text-foreground p-6 lg:p-8 container mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion de la Trésorerie & Frais
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gère les comptes de dépôt de l'école et la structure tarifaire.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Nouveau Portefeuille
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" /> Créer un Type de Frais
          </Button>
        </div>
      </div>

      {/* --- SECTION 1 : VUE ENTRÉES/SORTIES PAR PORTEFEUILLE --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <WalletCards className="w-5 h-5 text-primary" /> Comptes et
          Portefeuilles Actifs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {walletAccountsData.map((wallet) => {
            const Icon = wallet.icon;
            return (
              <Card
                key={wallet.id}
                className="border border-border bg-card shadow-sm rounded-xl"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${wallet.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono tracking-wider uppercase"
                    >
                      {wallet.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {wallet.name}
                    </p>
                    <h3 className="text-2xl font-bold font-mono mt-1 text-foreground">
                      {wallet.balance.toLocaleString()}{" "}
                      <span className="text-sm font-sans font-normal text-muted-foreground">
                        {wallet.currency}
                      </span>
                    </h3>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/50 text-[11px] font-medium text-muted-foreground justify-between">
                    <span className="flex items-center gap-1">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />{" "}
                      +12% Encaissés
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />{" "}
                      -2% Ajustements
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* --- SECTION 2 : STRUCTURE DES TYPES DE FRAIS --- */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> Catalogue et Types de
            Frais
          </h2>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-primary font-semibold gap-1"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exporter le barème
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Libellé du Frais</th>
                  <th className="p-4">Montant Fixé</th>
                  <th className="p-4">Compte de Destination</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {currentFeeTypes.map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-semibold text-foreground flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-primary" />
                      </div>
                      {fee.name}
                    </td>
                    <td className="p-4 font-mono font-bold text-foreground">
                      {fee.amount.toLocaleString()} {fee.currency}
                    </td>
                    <td className="p-4 text-muted-foreground flex items-center gap-1.5 mt-1.5">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {fee.targetWallet}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">
                      {fee.description}
                    </td>
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
    </div>
  );
}
