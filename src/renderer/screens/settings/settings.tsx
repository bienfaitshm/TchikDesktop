"use client";

import { useState, useEffect } from "react";
import {
  useCurrentConfig,
  useConfigActions,
  useIsConfigSyncing,
} from "@/renderer/libs/stores/app-store";
import { ThemeMode } from "@/renderer/libs/stores/app-store";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Badge } from "@/renderer/components/ui/badge";
import {
  Printer,
  Moon,
  Sun,
  Laptop,
  RefreshCw,
  School,
  Calendar,
  RotateCcw,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";

export const SettingsPage = () => {
  const { school, year, theme, posPrint, isConfigured } = useCurrentConfig();
  const { setTheme, setPosPrintConfig, syncFreshData, resetConfiguration } =
    useConfigActions();
  const isSyncing = useIsConfigSyncing();

  // État local pour le formulaire POS Print
  const [host, setHost] = useState(posPrint?.host ?? "localhost");
  const [port, setPort] = useState(posPrint?.port?.toString() ?? "9100");
  const [isSavingPos, setIsSavingPos] = useState(false);

  useEffect(() => {
    if (posPrint) {
      setHost(posPrint.host);
      setPort(posPrint.port.toString());
    }
  }, [posPrint]);

  const handleSavePosConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPort = Number.parseInt(port, 10);

    if (Number.isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
      toast.error("Veuillez saisir un numéro de port valide (1-65535).");
      return;
    }

    setIsSavingPos(true);
    try {
      await setPosPrintConfig({ host, port: parsedPort });
      toast.success("Configuration d'impression POS enregistrée.");
    } catch (error) {
      toast.error("Échec de la mise à jour de la configuration POS.");
    } finally {
      setIsSavingPos(false);
    }
  };

  const handleSyncDb = async () => {
    try {
      await syncFreshData();
      toast.success("Données d'école et d'année synchronisées avec la BDD.");
    } catch (error) {
      toast.error("Erreur lors de la synchronisation BDD.");
    }
  };

  const handleResetConfig = async () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser la sélection d'école et d'année ?",
      )
    ) {
      await resetConfiguration();
      toast.info("Configuration école/année réinitialisée.");
    }
  };

  return (
    <PageContainer className="max-w-(--breakpoint-md) mx-0 lg:pt-6">
      <PageHeader className="">
        <PageHeaderTextContent>
          <PageHeadTitle>Paramètres</PageHeadTitle>
          <PageHeadDescription>
            Gérez la configuration matérielle, l'apparence et le contexte de
            l'application.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>

      <PageContent className="grid gap-6">
        {/* 1. SECTEUR CONTEXTE ACADÉMIQUE */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" /> Contexte Actif
                </CardTitle>
                <CardDescription>
                  École et année académique couramment sélectionnées.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncDb}
                disabled={isSyncing}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                Synchroniser BDD
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card/50 flex items-start gap-3">
                <School className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    École courante
                  </p>
                  <p className="text-sm font-semibold">
                    {school ? school.name : "Aucune école sélectionnée"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card/50 flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Année Académique
                  </p>
                  <p className="text-sm font-semibold">
                    {year
                      ? (year.yearName ?? year.yearId)
                      : "Aucune année sélectionnée"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Badge variant={isConfigured ? "default" : "destructive"}>
                {isConfigured
                  ? "Contexte configuré"
                  : "Configuration incomplète"}
              </Badge>

              {isConfigured && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetConfig}
                  className="text-destructive hover:text-destructive gap-1"
                >
                  <RotateCcw className="h-4 w-4" /> Réinitialiser le contexte
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. IMPRESSION POS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" /> Imprimante POS
            </CardTitle>
            <CardDescription>
              Configuration réseau du serveur/imprimante de tickets POS
              (ESC/POS).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePosConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pos-host">Adresse Host / IP</Label>
                  <Input
                    id="pos-host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost ou 192.168.1.50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pos-port">Port d'écoute</Label>
                  <Input
                    id="pos-port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="9100"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingPos}
                  size="sm"
                  className="gap-2"
                >
                  <Check className="h-4 w-4" /> Enregistrer le POS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 3. APPARENCE / THÈME */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" /> Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez le thème visuel de l'application desktop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode d'affichage</Label>
                <p className="text-xs text-muted-foreground">
                  Sélectionnez un thème sombre, clair ou aligné sur votre
                  système.
                </p>
              </div>

              <Select
                value={theme ?? "system"}
                onValueChange={(val: ThemeMode) => setTheme(val)}
              >
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Choisir un thème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Clair
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> Sombre
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" /> Système
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};
