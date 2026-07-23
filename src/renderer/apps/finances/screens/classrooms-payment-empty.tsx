import { Presentation } from "lucide-react";

/**
 * Empty state view prompted when no classroom is selected in the payment view.
 * Guides the user to select a class from the navigation sidebar.
 * @returns The rendered empty state placeholder.
 */
export const ClassroomPaymentEmptyState = () => {
  return (
    <div className="flex h-full max-h-[75%] w-full flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted/60 ring-8 ring-muted/20">
          <Presentation className="size-8 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Sélectionnez une classe
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Choisissez une classe dans le menu latéral pour consulter le suivi
            des paiements.
          </p>
        </div>
      </div>
    </div>
  );
};

ClassroomPaymentEmptyState.displayName = "ClassroomPaymentEmptyState";
