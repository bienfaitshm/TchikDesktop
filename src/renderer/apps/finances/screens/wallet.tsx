"use client";

import React from "react";
import { Plus, WalletIcon, Pencil, Trash2 } from "lucide-react";
import type { Wallet } from "@/packages/@core/data-access/db/schemas";
import { Button } from "@/renderer/components/ui/button";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import {
  useGetFeeTypes,
  useGetWallets,
} from "@/renderer/libs/queries/finances";
import { FeeTypeTable } from "../tables/fee-types";
import { Spinner } from "@/renderer/components/ui/spinner";
import { cn } from "@/renderer/utils";
import { formatCurrency } from "@/packages/currency";
import {
  WalletDialogCreateForm,
  WalletDialogDeleteForm,
  WalletDialogUpdateForm,
  FeeTypeDialogCreateForm,
  type WalletDialogProps,
} from "@/renderer/apps/finances/dialog";
import {
  PageContainer,
  PageContent,
  PageHeadAction,
  PageHeadDescription,
  PageHeader,
  PageHeaderTextContent,
  PageHeadTitle,
} from "@/renderer/containers/page-container";
import {
  ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

export interface WalletRowActionProps extends Pick<
  WalletDialogProps,
  "mutationKey"
> {
  wallet: Wallet;
}

const MENUS: ActionMenuConfig<WalletRowActionProps>[] = [
  {
    id: "edit",
    label: "Modifier le portefeuille",
    icon: Pencil,
    dialog({ wallet, mutationKey }) {
      return (
        <WalletDialogUpdateForm
          mutationKey={mutationKey}
          defaultValues={{
            currentBalance: wallet.currentBalance,
            currency: wallet.currency,
            schoolId: wallet.schoolId,
            walletId: wallet.walletId,
            name: wallet.name,
          }}
          walletId={wallet.walletId}
          schoolId={wallet.schoolId ?? ""}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer le portefeuille",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ wallet, mutationKey }) {
      return (
        <WalletDialogDeleteForm
          mutationKey={mutationKey}
          id={wallet.walletId}
          name={wallet.name}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus containing edit and delete options for a specific financial wallet.
 * @param props - Component properties containing the wallet entity and mutation key.
 * @returns The rendered action menu component.
 */
export const WalletRowAction: React.FC<WalletRowActionProps> =
  createActionMenus<WalletRowActionProps>(MENUS);

export interface WalletGridProps {
  wallets: Wallet[];
  mutationKey?: readonly unknown[];
}

/**
 * Renders a responsive fluid grid layout displaying financial wallets with balances and currencies.
 * @param props - Component properties containing the list of wallets and mutation key.
 * @returns The rendered wallet grid component.
 */
export function WalletGrid({ wallets, mutationKey }: WalletGridProps) {
  if (!wallets?.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground p-6 bg-zinc-50/50 dark:bg-zinc-900/10">
        Aucun compte financier ou portefeuille configuré.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wallets.map((wallet) => (
        <div
          key={wallet.walletId}
          className={cn(
            "p-6 rounded-2xl border bg-card text-card-foreground",
            "hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4",
          )}
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <WalletIcon className="w-5 h-5" />
            </div>
            <WalletRowAction wallet={wallet} mutationKey={mutationKey} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {wallet.name}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrency(wallet.currentBalance, wallet.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main application screen component for supervising institution treasury and managing fee structures.
 * @returns Rendered school wallet page layout with grids, tables, and dialog triggers.
 */
export function SchoolWalletPage() {
  const { schoolId, yearId } = useSchoolContext();

  const {
    data: wallets,
    queryKey: walletQueryKey,
    isLoading: isLoadingWallets,
  } = useGetWallets({ where: { wallets: { schoolId } } });

  const {
    data: feeTypes,
    queryKey: feeTypeQueryKey,
    isLoading: isLoadingFees,
  } = useGetFeeTypes({ where: { feeTypes: { schoolId } } });

  return (
    <PageContainer>
      <PageHeader className="border-b">
        <PageHeaderTextContent>
          <PageHeadTitle>Trésorerie & Structure de Frais</PageHeadTitle>
          <PageHeadDescription>
            Supervisez les liquidités de l'établissement et organisez les
            politiques tarifaires.
          </PageHeadDescription>
        </PageHeaderTextContent>
        <PageHeadAction>
          <div className="flex items-center gap-3 self-start md:self-center">
            <WalletDialogCreateForm
              schoolId={schoolId}
              mutationKey={walletQueryKey}
              defaultValues={{ schoolId }}
            >
              <Button variant="outline" size="sm" className="gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> Nouveau compte
              </Button>
            </WalletDialogCreateForm>
            <FeeTypeDialogCreateForm
              schoolId={schoolId}
              defaultValues={{ schoolId, yearId }}
              mutationKey={feeTypeQueryKey}
            >
              <Button size="sm" className="gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> Créer un type de frais
              </Button>
            </FeeTypeDialogCreateForm>
          </div>
        </PageHeadAction>
      </PageHeader>
      <PageContent className="space-y-8 mt-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Portefeuilles & Comptes Courants
            </h2>
          </div>

          {isLoadingWallets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-muted/50"
                />
              ))}
            </div>
          ) : (
            <WalletGrid wallets={wallets || []} mutationKey={walletQueryKey} />
          )}
        </section>

        <section className="space-y-4 pt-2">
          <div className="space-y-1 mb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Frais de Scolarité & Échéanciers
            </h2>
            <p className="text-xs text-muted-foreground">
              Configuration des structures générales de facturation par année
              académique.
            </p>
          </div>

          {isLoadingFees ? (
            <div className="flex h-48 items-center justify-center border rounded-2xl bg-muted/20">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : (
            <div>
              <FeeTypeTable
                feeTypes={feeTypes || []}
                mutationKey={feeTypeQueryKey}
                schoolId={schoolId}
              />
            </div>
          )}
        </section>
      </PageContent>
    </PageContainer>
  );
}
