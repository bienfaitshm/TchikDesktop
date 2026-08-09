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
import { Calendar, Palette, PrinterIcon, School } from "lucide-react";

const sections: SettingSection[] = [
  {
    label: "Espace de travail",
    keywords:
      "Contexte d'établissement École active Année académique Synchroniser BDD Réinitialiser",
    items: [
      {
        title: "École active",
        description:
          " Sélectionnez l'imprimante, configurez l'adresse réseau, testez la connexion et effectuez un tirage de contrôle.",
        icon: <School className="h-5 w-5" />,
        color: "bg-emerald-500 text-white",
        content: <></>,
      },
      {
        title: "Année académique",
        description:
          " Sélectionnez l'imprimante, configurez l'adresse réseau, testez la connexion et effectuez un tirage de contrôle.",
        icon: <Calendar className="h-5 w-5" />,
        color: "bg-blue-500 text-white",
        content: <></>,
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
          " Sélectionnez l'imprimante, configurez l'adresse réseau, testez la connexion et effectuez un tirage de contrôle.",
        icon: <PrinterIcon className="h-5 w-5" />,
        color: "bg-amber-500 text-white",
        content: <></>,
      },
    ],
  },
  {
    label: " Apparence & Interface",
    keywords:
      "Apparence & Interface Mode d'affichage thème sombre clair système palette",
    items: [
      {
        title: "Mode d'affichage",
        description:
          "Basculez entre le thème sombre, clair ou synchronisé sur votre système.",
        icon: <Palette className="h-5 w-5" />,
        color: "bg-purple-600 text-white",
        content: <></>,
      },
    ],
  },
];

export const SettingsPage = () => {
  return (
    <PageContainer className="max-w-4xl mx-0 lg:pt-6">
      <SettingsSearchProvider sections={sections}>
        <PageHeader>
          <PageHeaderTextContent className="w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="mb-5">
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
