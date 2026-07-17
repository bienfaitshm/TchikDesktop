"use client";
import { Separator } from "@/renderer/components/ui/separator";
import { useGetStudentPayments } from "@/renderer/libs/queries/finances";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { PaymentTable } from "../tables/payement-history";

export function PaymentsHistoryPage() {
  const { schoolId, yearId } = useCurrentConfig();
  const { data: payments = [] } = useGetStudentPayments({
    where: { yearId, schoolId },
    limit: 50,
  });

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      {/* En-tête de page & Lien de retour */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Historique des Reçus
          </h1>
          <p className="text-sm text-muted-foreground">
            Registre complet des pièces comptables et paiements effectués par
            les élèves.
          </p>
        </div>

        {/* Actions utilitaires de comptabilité */}
        <div className="flex items-center gap-2 self-start sm:self-auto"></div>
      </div>

      <Separator />

      <div className="mt-4">
        <PaymentTable payments={payments} />
      </div>
    </div>
  );
}
