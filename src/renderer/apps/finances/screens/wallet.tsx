import type { FeeType } from "@/packages/@core/data-access/db/schemas";
import { Plus, Wallet, AlertCircle, X } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  WalletDialogCreateForm,
  WalletDialogDeleteForm,
  WalletDialogUpdateForm,
  FeeScheduleDialogCreateForm,
  FeeScheduleDialogDeleteForm,
  FeeScheduleDialogUpdateForm,
  FeeTypeDialogCreateForm,
  FeeTypeDialogDeleteForm,
  FeeTypeDialogUpdateForm,
  type FeeTypeDialogProps,
  FeeScheduleDialogBulkToggleForm,
} from "@/renderer/apps/finances/dialog";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import {
  useGetFeeTypes,
  useGetWallets,
  useGetFeeSchedules,
} from "@/renderer/libs/queries/finances";
import {
  ActionContainer,
  ActionTile,
  ActionTileDelete,
  ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles";
import { FeeTypeTable } from "../tables/fee-types";
import { cn } from "@/renderer/utils";
import React, { useState } from "react";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { Spinner } from "@/renderer/components/ui/spinner";

interface WalletData {
  walletId: string;
  currency: string;
  name: string;
  currentBalance: number;
}

interface WalletGridProps {
  wallets: WalletData[];
  activeWalletId?: string;
  onSelectWallet: (id?: string) => void;
}

interface OptionRowActionsProps extends Pick<
  FeeTypeDialogProps,
  "mutationKey"
> {
  feeType: FeeType;
  schoolId: string;
}

const RenderAction: React.FC<OptionRowActionsProps> = ({
  feeType,
  mutationKey,
  schoolId,
}) => {
  const { data: feeSchedules = [] } = useGetFeeSchedules({
    where: { feeTypeId: feeType.feeTypeId },
  });

  return (
    <div className="p-4 bg-muted/30 rounded-lg space-y-4">
      <ActionContainer>
        <FeeScheduleDialogBulkToggleForm
          schoolId={schoolId}
          mutationKey={mutationKey}
          defaultValues={{ feeTypeId: feeType.feeTypeId }}
        >
          <ActionTile
            label="Ajouter un échéancier"
            description="Ajouter les tranches de paiement pour ce frais"
            icon={Plus}
          />
        </FeeScheduleDialogBulkToggleForm>

        <FeeTypeDialogUpdateForm
          schoolId={schoolId}
          mutationKey={mutationKey}
          feeTypeId={feeType.feeTypeId}
          defaultValues={feeType}
        >
          <ActionTileEdit />
        </FeeTypeDialogUpdateForm>

        <FeeTypeDialogDeleteForm
          mutationKey={mutationKey}
          feeTypeId={feeType.feeTypeId}
          name={feeType.name}
        >
          <ActionTileDelete />
        </FeeTypeDialogDeleteForm>
      </ActionContainer>

      {/* Affichage visuel amélioré des échéanciers */}
      {feeSchedules.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {feeSchedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="bg-background border rounded-md p-3 text-sm flex justify-between items-center shadow-sm"
            >
              <span className="font-medium">{schedule.installmentName}</span>
              {/* Ajouter le montant ici si disponible */}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full p-8 flex justify-center items-center gap-3">
          <p className="text-sm text-muted-foreground italic flex items-center gap-2 text-center">
            <AlertCircle className="w-4 h-4" /> Aucun échéancier configuré.
          </p>
        </div>
      )}
    </div>
  );
};

export function WalletGrid({
  wallets,
  activeWalletId,
  onSelectWallet,
}: WalletGridProps) {
  if (!wallets?.length) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        Aucun portefeuille trouvé.
      </div>
    );
  }

  const activeWallet = React.useMemo(
    () => wallets.find((wallet) => wallet.walletId === activeWalletId),
    [wallets, activeWalletId],
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {wallets.map((acc) => {
          const isActive = activeWalletId === acc.walletId;
          return (
            <div
              key={acc.walletId}
              onClick={() => onSelectWallet(acc.walletId)}
              className={cn(
                "min-w-48 p-5 rounded-2xl cursor-pointer transition-all duration-200 snap-start border border-transparent",
                "hover:shadow-md hover:-translate-y-1 bg-accent",
                isActive &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-lg bg-primary/5 border-primary/20",
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <div
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="bg-[#EA580C] text-white font-medium text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                  {acc.currency}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1 font-medium truncate">
                {acc.name}
              </p>
              {/* Formatage du montant recommandé ici (ex: Intl.NumberFormat) */}
              <p className="text-xl font-bold tracking-tight">
                {acc.currentBalance}
              </p>
            </div>
          );
        })}
      </div>
      {activeWallet && (
        <div>
          <ActionContainer className="justify-start">
            <WalletDialogUpdateForm>
              <ActionTileEdit />
            </WalletDialogUpdateForm>
            <WalletDialogDeleteForm>
              <ActionTileDelete />
            </WalletDialogDeleteForm>
            <ActionTile
              label="Fermer"
              description="Fermer la modification"
              icon={X}
              onClick={() => onSelectWallet(undefined)}
            />
          </ActionContainer>
        </div>
      )}
    </div>
  );
}

export function SchoolWalletPage() {
  const { schoolId, yearId } = useSchoolContext();
  const [activeWalletId, setActiveWalletId] = useState<string | undefined>();
  const { data: wallets, isLoading: isLoadingWallets } = useGetWallets({
    where: { schoolId },
  });
  const {
    data: feeTypes,
    queryKey: tableQueryKey,
    isLoading: isLoadingFees,
  } = useGetFeeTypes({ where: { schoolId } });

  return (
    <div className="min-h-screen font-sans bg-background text-foreground px-6 lg:px-8 container mx-auto py-8 space-y-12">
      {/* Header global */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Trésorerie & Structure Tarifaire
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez les comptes de dépôt de l'école et configurez les types de
              frais.
            </p>
          </div>
        </div>
        {/* Section Wallets */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-muted-foreground" />
              Comptes Financiers
            </h2>
          </div>

          {isLoadingWallets ? (
            <div className="flex h-32 items-center justify-center bg-accent/50 rounded-2xl animate-pulse">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : (
            <WalletGrid
              schoolId={schoolId}
              wallets={wallets || []}
              activeWalletId={activeWalletId}
              onSelectWallet={setActiveWalletId}
            />
          )}
        </section>
      </div>

      {/* Section Fee Types */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold">Types de Frais Scolaires</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Définissez les frais et leurs échéanciers respectifs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WalletDialogCreateForm schoolId={schoolId}>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Nouveau Compte
              </Button>
            </WalletDialogCreateForm>
            <FeeTypeDialogCreateForm
              schoolId={schoolId}
              defaultValues={{ schoolId, yearId }}
            >
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Créer un Type de Frais
              </Button>
            </FeeTypeDialogCreateForm>
          </div>
        </div>

        {isLoadingFees ? (
          <div className="flex h-64 items-center justify-center border rounded-lg">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : (
          <FeeTypeTable
            feeTypes={feeTypes || []}
            renderDetail={(feeType) => (
              <Suspense
                fallback={
                  <div className="w-full p-8 flex justify-center items-center text-muted-foreground gap-3">
                    <Spinner className="w-5 h-5" /> Chargement des détails...
                  </div>
                }
              >
                <RenderAction
                  mutationKey={tableQueryKey}
                  feeType={feeType}
                  schoolId={schoolId}
                />
              </Suspense>
            )}
          />
        )}
      </section>
    </div>
  );
}
