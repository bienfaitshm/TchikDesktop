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
import { DropdownMenuSeparator } from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import {
  WalletDialogCreateForm,
  WalletDialogDeleteForm,
  WalletDialogUpdateForm,
  FeeTypeDialogCreateForm,
  type FeeTypeDialogProps,
} from "@/renderer/apps/finances/dialog";

interface WalletRowActionProps extends Pick<FeeTypeDialogProps, "mutationKey"> {
  wallet: Wallet;
}

export const WalletRowAction: React.FC<WalletRowActionProps> = ({
  mutationKey,
  wallet,
}) => (
  <ActionMenu
    trigger={<ButtonMenu />}
    dialogs={
      <>
        <MenuDialogWrapper id="edit">
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
            schoolId={wallet.schoolId as string}
          />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="delete">
          <WalletDialogDeleteForm
            mutationKey={mutationKey}
            walletId={wallet.walletId}
            name={wallet.name}
          />
        </MenuDialogWrapper>
      </>
    }
  >
    <MenuDialogItem targetId="edit" className="gap-2 cursor-pointer">
      <Pencil className="size-4 text-muted-foreground" />
      <span>Modifier le portefeuille</span>
    </MenuDialogItem>

    <DropdownMenuSeparator />

    <MenuDialogItem
      targetId="delete"
      className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      <Trash2 className="size-4" />
      <span>Supprimer le portefeuille</span>
    </MenuDialogItem>
  </ActionMenu>
);

interface WalletGridProps {
  wallets: Wallet[];
  mutationKey?: readonly unknown[];
}

export function WalletGrid({ wallets, mutationKey }: WalletGridProps) {
  if (!wallets?.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground p-4 bg-zinc-50/50 dark:bg-zinc-900/10">
        Aucun compte financier ou portefeuille configuré.
      </div>
    );
  }

  return (
    /* GRID FLUIDE ET RESPONSIVE : S'adapte à toutes les tailles d'écrans sans casser le layout */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {wallets.map((wallet) => (
        <div
          key={wallet.walletId}
          className={cn(
            "p-5 rounded-2xl border ",
            "hover:shadow-md transition-all duration-200",
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl">
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

export function SchoolWalletPage() {
  const { schoolId, yearId } = useSchoolContext();

  const {
    data: wallets,
    queryKey: walletQueryKey,
    isLoading: isLoadingWallets,
  } = useGetWallets({ where: { wallets: { schoolId: { $eq: schoolId } } } });

  const {
    data: feeTypes,
    queryKey: feeTypeQueryKey,
    isLoading: isLoadingFees,
  } = useGetFeeTypes({ where: { feeTypes: { schoolId: { $eq: schoolId } } } });

  return (
    <div className="min-h-screen w-full py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Trésorerie & Structure Tarifaire
            </h1>
            <p className="text-sm text-muted-foreground">
              Supervisez les liquidités de l'établissement et orchestrez la
              politique de tarification.
            </p>
          </div>

          {/* Actions globales groupées */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <WalletDialogCreateForm
              schoolId={schoolId}
              mutationKey={walletQueryKey}
            >
              <Button variant="outline" size="sm" className="gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> Nouveau Compte
              </Button>
            </WalletDialogCreateForm>
            <FeeTypeDialogCreateForm
              schoolId={schoolId}
              defaultValues={{ schoolId, yearId }}
              mutationKey={feeTypeQueryKey}
            >
              <Button size="sm" className="gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> Créer un Type de Frais
              </Button>
            </FeeTypeDialogCreateForm>
          </div>
        </div>

        {/* Section 1 : Comptes Financiers */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Portefeuilles & Comptes Courants
            </h2>
          </div>

          {isLoadingWallets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32  animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <WalletGrid wallets={wallets || []} mutationKey={walletQueryKey} />
          )}
        </section>

        {/* Section 2 : Tableau des types de frais */}
        <section className="space-y-4 pt-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Frais d'Études & Échéanciers
            </h2>
            <p className="text-xs text-muted-foreground">
              Configuration de la structure de facturation générale par année
              scolaire.
            </p>
          </div>

          {isLoadingFees ? (
            <div className="flex h-48 items-center justify-center border  rounded-2xl">
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
      </div>
    </div>
  );
}
