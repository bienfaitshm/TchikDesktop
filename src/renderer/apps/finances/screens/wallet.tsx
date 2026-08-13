import { useMemo } from "react";
import { Wallet, ReceiptText } from "lucide-react";
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
import {
  FeeTypeContent,
  FeeTypeCreateContentAction,
  WalletContentItem,
  WalletCreateContentAction,
} from "./wallet.items";

/**
 * Provides memoized search sections configuration for financial wallets and fee structures.
 * @returns An array of settings sections containing metadata and action components.
 */
const useWalletSections = (): SettingSection[] => {
  return useMemo(
    () => [
      {
        label: "Portefeuilles & Comptes Courants",
        keywords:
          "Portefeuilles Comptes courants Banque Caisse Trésorerie Solde Devise Compte bancaire Financement",
        items: [
          {
            title: "Comptes & Portefeuilles",
            description:
              "Gérez les comptes bancaires, caisses et portefeuilles financiers de l'établissement.",
            icon: <Wallet className="h-5 w-5" />,
            color: "bg-emerald-500 text-white",
            content: <WalletContentItem />,
            action: <WalletCreateContentAction />,
          },
        ],
      },
      {
        label: "Structure de Frais Scolaires",
        keywords:
          "Frais de scolarité Échéanciers Tarification Type de frais Facturation Année académique Frais scolaires Coût",
        items: [
          {
            title: "Frais de Scolarité & Échéanciers",
            description:
              "Configuration des types de frais et des structures de facturation par année académique.",
            icon: <ReceiptText className="h-5 w-5" />,
            color: "bg-amber-500 text-white",
            content: <FeeTypeContent />,
            action: <FeeTypeCreateContentAction />,
          },
        ],
      },
    ],
    [],
  );
};

/**
 * Main management page component for school treasury and fee configuration.
 * @returns The rendered school wallet and fee structure settings page.
 */
export const SchoolWalletPage = (): React.JSX.Element => {
  const sections = useWalletSections();

  return (
    <PageContainer className="mx-0 max-w-4xl lg:pt-6">
      <SettingsSearchProvider sections={sections}>
        <PageHeader className="border-b">
          <PageHeaderTextContent className="w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-5 sm:mb-2">
              <PageHeadTitle>Trésorerie & Structure de Frais</PageHeadTitle>
              <PageHeadDescription>
                Supervisez les liquidités de l'établissement et organisez les
                politiques tarifaires.
              </PageHeadDescription>
            </div>

            <SettingsSearchInput placeholder="Rechercher un portefeuille, un type de frais..." />
          </PageHeaderTextContent>
        </PageHeader>

        <PageContent className="space-y-10">
          <SettingsSearchList />
        </PageContent>
      </SettingsSearchProvider>
    </PageContainer>
  );
};
