"use client";

import { useState, useEffect } from "react";
import {
  useCurrentConfig,
  useConfigActions,
  useIsConfigSyncing,
  ThemeMode,
} from "@/renderer/libs/stores/app-store";

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
  Printer as PrinterIcon,
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
  Wifi,
  FileText,
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
import {
  useGetPrinters,
  useTestPrinter,
} from "@/renderer/libs/queries/printing";

/**
 * Normalizes a string by converting it to lowercase and removing accents.
 * @param text - The string to normalize.
 * @returns The cleanly formatted string used for search indexing.
 */
const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Checks if a search query is contained within a given set of keywords.
 * @param keywords - The target text containing searchable terms.
 * @param query - The raw user search input.
 * @returns True if the query matches the keywords, false otherwise.
 */
const matchKeywords = (keywords: string, query: string): boolean => {
  if (!query.trim()) return true;
  return normalizeText(keywords).includes(normalizeText(query));
};

/**
 * Validates whether a given string represents a valid network port.
 * @param port - The network port as a string.
 * @returns True if the port is a number between 1 and 65535, false otherwise.
 */
const isValidPort = (port: string): boolean => {
  const parsed = Number.parseInt(port, 10);
  return !Number.isNaN(parsed) && parsed > 0 && parsed <= 65535;
};

/**
 * Main settings page for managing school context, printer setup, and UI preferences.
 * @returns The rendered React component for the settings view.
 */
export const SettingsPage = () => {
  const { school, year, theme, posPrint, isConfigured } = useCurrentConfig();
  const { data: printers = [] } = useGetPrinters();
  const { setTheme, setPosPrintConfig, syncFreshData, resetConfiguration } =
    useConfigActions();
  const isSyncing = useIsConfigSyncing();

  const testPrinterMutation = useTestPrinter();

  const [selectedDevice, setSelectedDevice] = useState<string>(
    posPrint?.deviceName ?? "",
  );
  const [host, setHost] = useState<string>(posPrint?.host ?? "localhost");
  const [port, setPort] = useState<string>(
    posPrint?.port?.toString() ?? "9100",
  );
  const [isSavingPos, setIsSavingPos] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (posPrint) {
      setSelectedDevice(posPrint.deviceName ?? "");
      setHost(posPrint.host ?? "localhost");
      setPort(posPrint.port?.toString() ?? "9100");
    }
  }, [posPrint]);

  /**
   * Updates the local state when a printer is selected from the dropdown.
   * @param deviceName - The name of the selected printer.
   */
  const handleSelectPrinter = (deviceName: string) => {
    setSelectedDevice(deviceName);
  };

  /**
   * Validates port configuration and attempts a connection health check with the printer.
   * @returns A promise resolving to true if connection succeeds, false otherwise.
   */
  const handleCheckConnectivity = async (): Promise<boolean> => {
    if (!isValidPort(port)) {
      toast.error("Veuillez saisir un numéro de port valide (1-65535).");
      return false;
    }

    try {
      await testPrinterMutation.mutateAsync({
        printerName: selectedDevice || "default Name",
      });
      toast.success("Connexion à l'imprimante établie avec succès.");
      return true;
    } catch {
      toast.error("Impossible de contacter l'imprimante.");
      return false;
    }
  };

  /**
   * Triggers a physical test print to verify the ESC/POS printer behavior.
   */
  const handleTestPrint = async () => {
    try {
      await testPrinterMutation.mutateAsync({
        printerName: selectedDevice || "default Name",
      });
      toast.success("Impression de test envoyée avec succès.");
    } catch {
      toast.error("Échec de l'impression du ticket de test.");
    }
  };

  /**
   * Validates inputs and persists the POS printing configuration to the global store.
   * @param e - The form submission event.
   */
  const handleSavePosConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPort(port)) {
      toast.error("Veuillez saisir un numéro de port valide (1-65535).");
      return;
    }

    setIsSavingPos(true);
    try {
      await setPosPrintConfig({
        deviceName: selectedDevice,
        host,
        port: Number.parseInt(port, 10),
      });
      toast.success("Configuration d'impression POS enregistrée.");
    } catch {
      toast.error("Échec de la mise à jour de la configuration POS.");
    } finally {
      setIsSavingPos(false);
    }
  };

  /**
   * Dispatches an action to synchronize application data with the remote database.
   */
  const handleSyncDb = async () => {
    try {
      await syncFreshData();
      toast.success("Données d'école et d'année synchronisées avec la BDD.");
    } catch {
      toast.error("Erreur lors de la synchronisation BDD.");
    }
  };

  /**
   * Prompts the user and resets the active school and academic year configuration.
   */
  const handleResetConfig = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser la sélection d'école et d'année ?",
      )
    ) {
      await resetConfiguration();
      toast.info("Configuration école/année réinitialisée.");
    }
  };

  const showSectionContext = matchKeywords(
    "Contexte d'établissement École active Année académique Synchroniser BDD Réinitialiser",
    searchQuery,
  );
  const showSectionHardware = matchKeywords(
    "Impression & Matériel Imprimante POS (ESC/POS) Adresse Host / IP Port d'écoute Réseau Connectivité Test",
    searchQuery,
  );
  const showSectionAppearance = matchKeywords(
    "Apparence & Interface Mode d'affichage thème sombre clair système palette",
    searchQuery,
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
        {!showSectionContext &&
          !showSectionHardware &&
          !showSectionAppearance && (
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

        {showSectionContext && (
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

        {showSectionContext &&
          (showSectionHardware || showSectionAppearance) && <Separator />}

        {showSectionHardware && (
          <section className="space-y-6">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Impression & Matériel
            </h2>

            <form onSubmit={handleSavePosConfig} className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                    <PrinterIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-sm font-medium leading-none">
                      Imprimante POS (ESC/POS)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Sélectionnez l'imprimante, configurez l'adresse réseau,
                      testez la connexion et effectuez un tirage de contrôle.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-13">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor="printer-select"
                    className="text-xs font-medium"
                  >
                    Imprimantes disponibles
                  </Label>
                  <Select
                    value={selectedDevice}
                    onValueChange={handleSelectPrinter}
                  >
                    <SelectTrigger id="printer-select" className="h-9 text-xs">
                      <SelectValue placeholder="Sélectionner une imprimante détectée" />
                    </SelectTrigger>
                    <SelectContent>
                      {printers.map((printer) => (
                        <SelectItem
                          key={printer.name}
                          value={printer.value}
                          className="text-xs"
                        >
                          {printer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="flex items-center gap-3 pt-2 sm:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCheckConnectivity}
                    disabled={testPrinterMutation.isPending}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Wifi
                      className={`h-3.5 w-3.5 ${
                        testPrinterMutation.isPending ? "animate-pulse" : ""
                      }`}
                    />
                    Tester la connectivité
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleTestPrint}
                    disabled={testPrinterMutation.isPending}
                    className="gap-1.5 text-xs h-8"
                  >
                    <FileText
                      className={`h-3.5 w-3.5 ${
                        testPrinterMutation.isPending ? "animate-spin" : ""
                      }`}
                    />
                    Impression de test
                  </Button>
                </div>
              </div>
            </form>
          </section>
        )}

        {showSectionHardware && showSectionAppearance && <Separator />}

        {showSectionAppearance && (
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
