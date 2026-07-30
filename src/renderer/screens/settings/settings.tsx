"use client";

import { useState, useEffect } from "react";
import {
  useCurrentConfig,
  useConfigActions,
  useIsConfigSyncing,
} from "@/renderer/libs/stores/app-store";
import { ThemeMode } from "@/renderer/libs/stores/app-store";

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
import { Separator } from "@/renderer/components/ui/separator";
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
  Palette,
  Search,
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

  // État local pour la recherche
  const [searchQuery, setSearchQuery] = useState("");

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

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const normalizedQuery = normalizeText(searchQuery);

  const matchSearch = (keywords: string) =>
    normalizeText(keywords).includes(normalizedQuery);

  const showSection1 = matchSearch(
    "Contexte d'établissement École active Année académique Synchroniser BDD Réinitialiser",
  );
  const showSection2 = matchSearch(
    "Impression & Matériel Imprimante POS (ESC/POS) Adresse Host / IP Port d'écoute Réseau",
  );
  const showSection3 = matchSearch(
    "Apparence & Interface Mode d'affichage thème sombre clair système palette",
  );

  return (
    <PageContainer className="max-w-4xl mx-0 lg:pt-6">
      <PageHeader>
        <PageHeaderTextContent className="w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="mb-5">
            <PageHeadTitle>Paramètres</PageHeadTitle>
            <PageHeadDescription>
              Gérez la configuration matérielle, l'apparence et le contexte de
              l'application.
            </PageHeadDescription>
          </div>

          {/* Barre de recherche */}
          <div className="relative w-full shrink-0 mt-4 sm:mt-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un paramètre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-full bg-background rounded-full"
            />
          </div>
        </PageHeaderTextContent>
      </PageHeader>

      <PageContent className="space-y-10">
        {/* Message si aucun résultat */}
        {!showSection1 && !showSection2 && !showSection3 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Aucun paramètre ne correspond à "{searchQuery}".
            </p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs"
            >
              Effacer la recherche
            </Button>
          </div>
        )}

        {/* ================= SECTION 1: CONTEXTE ACADÉMIQUE ================= */}
        {showSection1 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                Contexte d'établissement
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant={isConfigured ? "default" : "destructive"}>
                  {isConfigured ? "Contexte configuré" : "Incomplet"}
                </Badge>
                {isConfigured && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetConfig}
                    className="text-destructive hover:text-destructive gap-1 h-8 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* ITEM: ÉCOLE COURANTE */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                    <School className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">
                      École active
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {school
                        ? school.name
                        : "Aucune école sélectionnée actuellement."}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncDb}
                  disabled={isSyncing}
                  className="shrink-0 gap-2"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  Synchroniser BDD
                </Button>
              </div>

              {/* ITEM: ANNÉE ACADÉMIQUE */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-xs">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">
                      Année académique
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {year
                        ? (year.yearName ?? year.yearId)
                        : "Aucune année académique active."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {showSection1 && (showSection2 || showSection3) && <Separator />}

        {/* ================= SECTION 2: MATÉRIEL & PERIPHERIQUES ================= */}
        {showSection2 && (
          <section className="space-y-6">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Impression & Matériel
            </h2>

            <form onSubmit={handleSavePosConfig} className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                    <Printer className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-sm font-medium leading-none">
                      Imprimante POS (ESC/POS)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Définissez l'adresse réseau et le port d'écoute du serveur
                      d'impression de caisse.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingPos}
                  size="sm"
                  className="shrink-0 gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" /> Enregistrer
                </Button>
              </div>

              {/* Saisie Réseau alignée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-13">
                <div className="space-y-1.5">
                  <Label htmlFor="pos-host" className="text-xs font-medium">
                    Adresse Host / IP
                  </Label>
                  <Input
                    id="pos-host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost ou 192.168.1.50"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pos-port" className="text-xs font-medium">
                    Port d'écoute
                  </Label>
                  <Input
                    id="pos-port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="9100"
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>
            </form>
          </section>
        )}

        {showSection2 && showSection3 && <Separator />}

        {/* ================= SECTION 3: PERSONNALISATION ================= */}
        {showSection3 && (
          <section className="space-y-6">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Apparence & Interface
            </h2>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                  <Palette className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">
                    Mode d'affichage
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Basculez entre le thème sombre, clair ou synchronisé sur
                    votre système.
                  </p>
                </div>
              </div>

              <Select
                value={theme ?? "system"}
                onValueChange={(val: ThemeMode) => setTheme(val)}
              >
                <SelectTrigger className="w-40 h-9 text-xs">
                  <SelectValue placeholder="Choisir un thème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Sun className="h-3.5 w-3.5" /> Clair
                    </div>
                  </SelectItem>
                  <SelectItem value="dark" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Moon className="h-3.5 w-3.5" /> Sombre
                    </div>
                  </SelectItem>
                  <SelectItem value="system" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-3.5 w-3.5" /> Système
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
        )}
      </PageContent>
    </PageContainer>
  );
};
