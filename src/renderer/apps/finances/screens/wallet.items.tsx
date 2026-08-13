"use client";
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
  ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

/**
 * Shared mutation key for financial React Query cache management.
 */
export const FINANCE_MUTATION_KEY = ["fin"] as const;

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
export const WalletRowAction = createActionMenus<WalletRowActionProps>(MENUS);

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
            <p className="text-xs text-muted-foreground truncate">
              {wallet.name}
            </p>
            <p className="text-md font-bold tracking-tight">
              {formatCurrency(wallet.currentBalance, wallet.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Fetches and displays financial wallets in a grid layout with loading state.
 * @returns The wallet content view component.
 */
export const WalletContentItem = () => {
  const { schoolId } = useSchoolContext();

  const { data: wallets, isLoading: isLoadingWallets } = useGetWallets({
    where: { wallets: { schoolId } },
  });

  return (
    <div className="space-y-4">
      {isLoadingWallets ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={`wallet-skeleton-${index}`}
              className="h-32 animate-pulse rounded-2xl bg-muted/50"
            />
          ))}
        </div>
      ) : (
        <WalletGrid
          wallets={wallets || []}
          mutationKey={FINANCE_MUTATION_KEY}
        />
      )}
    </div>
  );
};

/**
 * Trigger button and dialog form for creating a new financial wallet.
 * @returns The wallet creation trigger action component.
 */
export const WalletCreateContentAction = () => {
  const { schoolId } = useSchoolContext();

  return (
    <WalletDialogCreateForm
      schoolId={schoolId}
      mutationKey={FINANCE_MUTATION_KEY}
      defaultValues={{ schoolId }}
    >
      <Button variant="outline" size="sm" className="gap-2 text-xs">
        <Plus className="w-4 h-4" /> Nouveau compte
      </Button>
    </WalletDialogCreateForm>
  );
};

/**
 * Fetches and displays the list of fee types for the current school and academic year.
 * @returns The fee type content view component.
 */
export const FeeTypeContent = () => {
  const { schoolId, yearId } = useSchoolContext();

  const { data: feeTypes, isLoading: isLoadingFees } = useGetFeeTypes({
    where: { feeTypes: { schoolId, yearId } },
  });

  return (
    <div>
      {isLoadingFees ? (
        <div className="flex h-48 items-center justify-center border rounded-2xl bg-muted/20">
          <Spinner className="w-6 h-6 text-primary" />
        </div>
      ) : (
        <FeeTypeTable
          feeTypes={feeTypes || []}
          mutationKey={FINANCE_MUTATION_KEY}
          schoolId={schoolId}
        />
      )}
    </div>
  );
};

/**
 * Trigger button and dialog form for creating a new fee type entry.
 * @returns The fee type creation trigger action component.
 */
export const FeeTypeCreateContentAction = () => {
  const { schoolId, yearId } = useSchoolContext();

  return (
    <FeeTypeDialogCreateForm
      schoolId={schoolId}
      defaultValues={{ schoolId, yearId }}
      mutationKey={FINANCE_MUTATION_KEY}
    >
      <Button size="sm" className="gap-2 text-xs">
        <Plus className="w-4 h-4" /> Créer un type de frais
      </Button>
    </FeeTypeDialogCreateForm>
  );
};
