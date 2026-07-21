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
  type WalletDialogProps,
} from "@/renderer/apps/finances/dialog";

export interface WalletRowActionProps extends Pick<
  WalletDialogProps,
  "mutationKey"
> {
  wallet: Wallet;
}

/**
 * Renders contextual action menus containing edit and delete options for a specific financial wallet.
 * @param props - Component properties containing the wallet entity and mutation key.
 * @returns The rendered action menu component.
 */
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
      <span>Edit wallet</span>
    </MenuDialogItem>

    <DropdownMenuSeparator />

    <MenuDialogItem
      targetId="delete"
      className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      <Trash2 className="size-4" />
      <span>Delete wallet</span>
    </MenuDialogItem>
  </ActionMenu>
);

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
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground p-4 bg-zinc-50/50 dark:bg-zinc-900/10">
        No financial accounts or wallets configured.
      </div>
    );
  }

  return (
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
  } = useGetWallets({ where: { wallets: { schoolId: { $eq: schoolId } } } });

  const {
    data: feeTypes,
    queryKey: feeTypeQueryKey,
    isLoading: isLoadingFees,
  } = useGetFeeTypes({ where: { feeTypes: { schoolId: { $eq: schoolId } } } });

  return (
    <div className="min-h-screen w-full py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Treasury & Fee Structure
            </h1>
            <p className="text-sm text-muted-foreground">
              Supervise institution liquidities and orchestrate pricing
              policies.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <WalletDialogCreateForm
              schoolId={schoolId}
              mutationKey={walletQueryKey}
            >
              <Button variant="outline" size="sm" className="gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> New Account
              </Button>
            </WalletDialogCreateForm>
            <FeeTypeDialogCreateForm
              schoolId={schoolId}
              defaultValues={{ schoolId, yearId }}
              mutationKey={feeTypeQueryKey}
            >
              <Button size="sm" className="gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> Create Fee Type
              </Button>
            </FeeTypeDialogCreateForm>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Wallets & Current Accounts
            </h2>
          </div>

          {isLoadingWallets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <WalletGrid wallets={wallets || []} mutationKey={walletQueryKey} />
          )}
        </section>

        <section className="space-y-4 pt-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Tuition Fees & Schedules
            </h2>
            <p className="text-xs text-muted-foreground">
              Configuration of general billing structures per academic year.
            </p>
          </div>

          {isLoadingFees ? (
            <div className="flex h-48 items-center justify-center border rounded-2xl">
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
