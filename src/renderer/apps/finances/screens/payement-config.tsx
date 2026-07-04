import React, { useState } from "react";
import {
  TrendingUp,
  Settings,
  CheckCircle2,
  XCircle,
  DollarSign,
  RefreshCw,
  Lock,
  Smartphone,
  CreditCard,
  AlertCircle,
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

export function SchoolPaymentConfigPage() {
  const [exchangeRate, setExchangeRate] = useState(2850);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulation d'une mise à jour automatique via API de change (ex: BCC)
  const handleRateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setExchangeRate(2845);
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen font-sans bg-background text-foreground p-6 lg:p-8 container mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurations Financières
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pilotez la politique monétaire interne de l'école et les méthodes de
            réception.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Sauvegarder les Paramètres
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- COLONNE DE GAUCHE : CONFIGURATION DU TAUX DE CHANGE --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border bg-card shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Taux de
                Référence Interne
              </CardTitle>
              <CardDescription>
                Définit la conversion globale pour tous les encaissements en CDF
                basés sur les structures en USD.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Box Taux de change */}
              <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 text-center space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Taux Appliqué Actuel
                </span>
                <div className="text-3xl font-mono font-bold text-foreground">
                  1 USD = {exchangeRate} CDF
                </div>
                <Badge
                  variant="outline"
                  className="bg-background text-primary border-primary/20 text-[10px]"
                >
                  Mis à jour il y a 2h
                </Badge>
              </div>

              {/* Input & Actions */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Ajustement manuel du Taux
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg h-9 px-3 text-sm font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-muted-foreground">
                      CDF
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1"
                    onClick={handleRateSync}
                    disabled={isSyncing}
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                    />{" "}
                    Synchroniser
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg flex gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Changer le taux impactera immédiatement le calcul des
                  reliquats et des dettes d'élèves en temps réel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- COLONNE DE DROITE : CANAUX DE PAIEMENT & PASSERELLES --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border bg-card shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Gestion des Canaux
                de Paiement
              </CardTitle>
              <CardDescription>
                Activez ou restreignez les moyens par lesquels les parents
                d'élèves peuvent régler les frais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Moyen 1: Cash */}
              <div className="p-4 border border-border bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-primary">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Encaissement Cash au Guichet
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Réception physique des fonds directement au secrétariat.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Actif
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Désactiver
                  </Button>
                </div>
              </div>

              {/* Moyen 2: M-Pesa */}
              <div className="p-4 border border-border bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-red-500">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Vodacom M-Pesa API
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Validation automatique des reçus via ID de transaction de
                      référence.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Actif
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Configurer
                  </Button>
                </div>
              </div>

              {/* Moyen 3: Virement bancaire */}
              <div className="p-4 border border-border bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Passerelle Cartes & Banques
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Paiement en ligne ou par dépôt de bordereaux bancaires.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-muted-foreground border-0 flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" /> Inactif
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 border-0"
                  >
                    Activer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
