import type { FeeType } from "@/packages/@core/data-access/db/schemas";
import { WalletCards, Plus, Wallet } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  WalletDialogCreateForm,
  WalletDialogDeleteForm,
  WalletDialogUpdateForm,
  FeeTypeDialogCreateForm,
} from "@/renderer/apps/finances/dialog";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import {
  useGetFeeTypes,
  useGetWallets,
} from "@/renderer/libs/queries/finances";

import { CreateOptionDialog } from "@/renderer/dialog-actions/option.dialog-actions";
import { FeeTypeTable } from "../tables/fee-types";

interface Wallet {
  walletId: string;
  currency: string;
  name: string;
  currentBalance: number;
}

interface WalletGridProps {
  wallets: Wallet[];
  schoolId: string;
}

export default function WalletGrid({ wallets, schoolId }: WalletGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {wallets.map((wallet) => (
          <div
            key={wallet.walletId}
            className="relative group border border-border/60 bg-card hover:border-border transition-all duration-200 rounded-2xl"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {wallet.name}
                </h3>
              </div>
              <div>
                <p className="text-4xl font-bold font-mono mt-2 text-foreground tracking-tight">
                  {wallet.currentBalance.toLocaleString()}{" "}
                  <span className="text-sm font-sans font-normal text-muted-foreground ml-1">
                    {wallet.currency}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <WalletDialogUpdateForm
                walletId={wallet.walletId}
                schoolId={schoolId}
                defaultValues={wallet}
              />
              <WalletDialogDeleteForm walletId={wallet.walletId} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function SchoolWalletPage() {
  const { schoolId } = useSchoolContext();
  const { data: wallets } = useGetWallets({ where: { schoolId } });
  const { data: feeTypes } = useGetFeeTypes({ where: { schoolId } });
  return (
    <div className="min-h-screen font-sans bg-background text-foreground px-6 lg:px-8 container mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion de la Trésorerie & Frais
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gère les comptes de dépôt de l'école et la structure tarifaire.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WalletDialogCreateForm schoolId={schoolId}>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Nouveau Portefeuille
            </Button>
          </WalletDialogCreateForm>
          <FeeTypeDialogCreateForm>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Plus className="w-4 h-4" /> Créer un Type de Frais
            </Button>
          </FeeTypeDialogCreateForm>
        </div>
      </div>

      {/* --- SECTION 1 : VUE ENTRÉES/SORTIES PAR PORTEFEUILLE --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <WalletCards className="w-5 h-5 text-primary" /> Comptes et
          Portefeuilles Actifs
        </h2>

        <WalletGrid schoolId={schoolId} wallets={wallets} />
      </div>

      <FeeTypeTable feeTypes={feeTypes} />
    </div>
  );
}
