import { useMemo } from "react";
import { Calendar, Palette, PrinterIcon, School } from "lucide-react";
import {
  SettingSection,
  SettingsSearchInput,
  SettingsSearchList,
  SettingsSearchProvider,
} from "@/renderer/containers/setting-search";
import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";
import { ThemeButton } from "./settings.theme";
import { SettingPrinter } from "./settings.printer";

/**
 * Custom hook providing memoized configuration sections for application settings.
 * @returns An array of setting sections with search metadata and interactive elements.
 */
const useSettingSections = (): SettingSection[] => {
  return useMemo(
    () => [
      {
        label: "Espace de travail",
        keywords:
          "Contexte d'établissement École active Année académique Synchroniser BDD Réinitialiser",
        items: [
          {
            title: "École active",
            description:
              "Sélectionnez et gérez l'établissement scolaire actuellement actif.",
            icon: <School className="h-5 w-5" />,
            color: "bg-emerald-500 text-white",
          },
          {
            title: "Année académique",
            description:
              "Configurez et basculez vers l'année scolaire en cours de traitement.",
            icon: <Calendar className="h-5 w-5" />,
            color: "bg-blue-500 text-white",
          },
        ],
      },
      {
        label: "Impression & Matériel",
        keywords:
          "Impression & Matériel Imprimante POS (ESC/POS) Adresse Host / IP Port d'écoute Réseau Connectivité Test",
        items: [
          {
            title: "Imprimante POS (ESC/POS)",
            description:
              "Sélectionnez l'imprimante, configurez l'adresse réseau, testez la connexion et effectuez un tirage de contrôle.",
            icon: <PrinterIcon className="h-5 w-5" />,
            color: "bg-amber-500 text-white",
            content: <SettingPrinter />,
          },
        ],
      },
      {
        label: "Apparence & Interface",
        keywords:
          "Apparence & Interface Mode d'affichage thème sombre clair système palette",
        items: [
          {
            title: "Mode d'affichage",
            description:
              "Basculez entre le thème sombre, clair ou synchronisé sur votre système.",
            icon: <Palette className="h-5 w-5" />,
            color: "bg-purple-600 text-white",
            action: <ThemeButton />,
          },
        ],
      },
    ],
    [],
  );
};

/**
 * Main application settings page layout component.
 * @returns The rendered settings page view with integrated search provider.
 */
export const SettingsPage = () => {
  const sections = useSettingSections();

  return (
    <PageContainer className="mx-0 max-w-4xl lg:pt-6">
      <SettingsSearchProvider sections={sections}>
        <PageHeader className="border-b">
          <PageHeaderTextContent className="w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-5 sm:mb-2">
              <PageHeadTitle>Paramètres</PageHeadTitle>
              <PageHeadDescription>
                Gérez la configuration matérielle, l'apparence et le contexte de
                l'application.
              </PageHeadDescription>
            </div>

            <SettingsSearchInput />
          </PageHeaderTextContent>
        </PageHeader>

        <PageContent className="space-y-10">
          <SettingsSearchList />
        </PageContent>
      </SettingsSearchProvider>
    </PageContainer>
  );
};
