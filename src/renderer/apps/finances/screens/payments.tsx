import { GoogleStyleSearchForm } from "../components/advanced-search";
import { GoogleSearchInput } from "../components/search";
import FastPaymentForm from "../forms/fast-payment-form";

export function FastPaymentPage() {
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
      <main className="w-full flex justify-center">
        {/* <FastPaymentForm /> */}
        {/* <GoogleStyleSearchForm /> */}
        <GoogleSearchInput />
      </main>
    </div>
  );
}
