import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { FastPaymentForm } from "../forms/fast-payment-form";

export function FastPaymentPage() {
  const { schoolId, yearId } = useCurrentConfig();
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 container mx-auto flex flex-col gap-6 md:gap-8">
      {/* Zone d'en-tête de la page */}
      <div className="flex flex-col gap-1 border-b border-border/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          Terminal de Caisse
        </h1>
        <p className="text-sm text-muted-foreground">
          Saisie rapide des encaissements physiques au guichet et édition
          instantanée des reçus d'écolage.
        </p>
      </div>

      {/* Zone de contenu principal */}
      <main>
        <FastPaymentForm schoolId={schoolId} yearId={yearId} />
      </main>
    </div>
  );
}
