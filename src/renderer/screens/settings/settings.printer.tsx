import { useMemo, useState, useCallback, useEffect } from "react";
import { FileText, Printer, Wifi, CheckCircle2, XCircle } from "lucide-react";
import {
  ComboBoxOption,
  GenericComboBox,
} from "@/renderer/components/form/fields/generic-combo-box";
import { LoadingButton as Button } from "@/renderer/components/buttons/button-loading";
import { ButtonGroup } from "@/renderer/components/ui/button-group";
import { Label } from "@/renderer/components/ui/label";
import { Badge } from "@/renderer/components/ui/badge";
import {
  useGetPrinters,
  useCheckPrinterForm,
  useTestPrinterForm,
} from "@/renderer/libs/queries/printing";
import {
  useConfigActions,
  useCurrentConfig,
} from "@/renderer/libs/stores/app-store";
import type { SystemPrinter } from "@/packages/pos-printer";

/**
 * Custom hook managing business logic, state, and mutations for POS printer setup.
 * @returns An object containing printer states, options, status flags, and action handlers.
 */
export const usePrinterSettings = () => {
  const { posPrint } = useCurrentConfig();
  const configActions = useConfigActions();
  const { data: printers = [] } = useGetPrinters();

  const [selectedPrinter, setSelectedPrinter] = useState<SystemPrinter | null>(
    posPrint?.posPrinter ?? null,
  );

  useEffect(() => {
    if (posPrint?.posPrinter) {
      setSelectedPrinter(posPrint.posPrinter);
    }
  }, [posPrint]);

  const checkPrinter = useCheckPrinterForm();
  const testPrinter = useTestPrinterForm();

  const printerMap = useMemo(() => {
    const map = new Map<string, SystemPrinter>();
    for (const item of printers) {
      if (item.value) {
        map.set(item.value, item);
      }
    }
    return map;
  }, [printers]);

  const printerOptions: ComboBoxOption[] = useMemo(
    () =>
      printers.map((item) => ({
        label: item.name || "Imprimante inconnue",
        value: item.value,
      })),
    [printers],
  );

  const isConnected = useMemo(
    () =>
      posPrint?.posPrinter?.value
        ? printerMap.has(posPrint.posPrinter.value)
        : false,
    [posPrint, printerMap],
  );

  const hasUnsavedChanges = useMemo(
    () => selectedPrinter?.value !== posPrint?.posPrinter?.value,
    [posPrint, selectedPrinter],
  );

  const handlePrinterSelect = useCallback(
    (value: string) => {
      const foundPrinter = printerMap.get(value);
      if (foundPrinter) {
        setSelectedPrinter(foundPrinter);
      }
    },
    [printerMap],
  );

  const handleSavePrinterConfig = useCallback(() => {
    if (selectedPrinter) {
      configActions.setPosPrintConfig({
        isConnected: true,
        posPrinter: selectedPrinter,
      });
    }
  }, [selectedPrinter, configActions]);

  const handleCheckConnectivity = useCallback(() => {
    if (selectedPrinter?.value) {
      checkPrinter.onSubmit(
        { printerValue: selectedPrinter.value },
        { reset: () => {} },
      );
    }
  }, [checkPrinter, selectedPrinter]);

  const handleTestPrint = useCallback(() => {
    if (selectedPrinter?.value) {
      testPrinter.onSubmit(
        { printerValue: selectedPrinter.value },
        { reset: () => {} },
      );
    }
  }, [testPrinter, selectedPrinter]);

  return {
    posPrint,
    selectedPrinter,
    printerOptions,
    isConnected,
    hasUnsavedChanges,
    isChecking: checkPrinter.isSubmitting,
    isTesting: testPrinter.isSubmitting,
    handlePrinterSelect,
    handleSavePrinterConfig,
    handleCheckConnectivity,
    handleTestPrint,
  };
};

/**
 * Renders an option item inside the printer selection combobox.
 * @param option - The combobox item to render.
 * @returns The rendered JSX element representing a printer option.
 */
const renderPrinterOption = (option: ComboBoxOption) => (
  <div className="flex items-center gap-2">
    <Printer className="h-4 w-4 shrink-0 text-muted-foreground" />
    <span className="truncate">{option.label}</span>
  </div>
);

/**
 * Renders the POS printer settings panel with status indicator and action controls.
 * @returns The rendered printer settings panel component.
 */
export const SettingPrinter = () => {
  const {
    posPrint,
    selectedPrinter,
    printerOptions,
    isConnected,
    hasUnsavedChanges,
    isChecking,
    isTesting,
    handlePrinterSelect,
    handleSavePrinterConfig,
    handleCheckConnectivity,
    handleTestPrint,
  } = usePrinterSettings();

  return (
    <div className="my-4 space-y-6">
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Imprimante configurée</Label>
          <p className="text-sm font-medium">
            {posPrint?.posPrinter?.name || "Aucune imprimante configurée"}
          </p>
        </div>

        {posPrint && (
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
          >
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Connectée</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                <span>Déconnectée</span>
              </>
            )}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="printer-select" className="text-xs font-medium">
          Imprimantes disponibles
        </Label>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <GenericComboBox<ComboBoxOption>
              id="printer-select"
              className="h-8 w-full"
              options={printerOptions}
              value={selectedPrinter?.value}
              onChangeValue={handlePrinterSelect}
              renderItem={renderPrinterOption}
            />
          </div>

          <ButtonGroup
            role="group"
            aria-label="Commandes d'action de l'imprimante"
            className="flex-wrap"
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              loading={isChecking}
              disabled={!selectedPrinter}
              onClick={handleCheckConnectivity}
              aria-label="Tester la connectivité de l'imprimante"
            >
              <Wifi className="h-4 w-4" />
              <span>Tester la connectivité</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              loading={isTesting}
              disabled={!selectedPrinter}
              onClick={handleTestPrint}
              aria-label="Imprimer un ticket de test"
            >
              <FileText className="h-4 w-4" />
              <span>Impression de test</span>
            </Button>

            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              disabled={!hasUnsavedChanges || !selectedPrinter}
              onClick={handleSavePrinterConfig}
              aria-label="Enregistrer la configuration de l'imprimante"
            >
              <span>Enregistrer</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
};
