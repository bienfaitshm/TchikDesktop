import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
} from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ProcessPaymentFormConfig,
  useProcessStudentPaymentForm,
} from "@/renderer/libs/queries/finances";
import { Loader2, Calendar, CreditCard, Receipt } from "lucide-react";
import { PaymentProcessForm } from "../forms/payment-process-form";

type DialogProps = Partial<React.ComponentProps<typeof Dialog>> & {
  children?: React.ReactNode;
  schoolId?: string;
  yearId?: string;
};

/* ==========================================================================
   1. HISTORIQUE DES PAIEMENTS (MINIMALISTE TIMELINE)
   ========================================================================== */
export const FeeAssignmentPaymentHistoryDialog: React.FC<DialogProps> = (
  props,
) => {
  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Historique des paiements
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Liste chronologique des versements effectués pour cette échéance.
          </DialogDescription>
        </DialogHeader>

        {/* Contenu type Timeline épurée style Stripe */}
        <div className="py-4 space-y-4 max-h-75 overflow-y-auto pr-1">
          {/* Exemple d'item de flux (à boucler avec tes datas réelles) */}
          <div className="flex items-start justify-between border-b border-border/40 pb-3 text-sm last:border-0 last:pb-0">
            <div className="flex gap-2.5 items-start">
              <div className="mt-0.5 rounded-md bg-muted p-1.5 text-muted-foreground">
                <Receipt className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  Versement #4920
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="size-3" /> 12 Janv. 2026 à 14:32
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono font-medium text-foreground text-sm">
                45 000 FCFA
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Espèces
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs font-medium"
            >
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ==========================================================================
   2. DÉTAILS DE L'ÉCHÉANCE
   ========================================================================== */
export const ViewPayementDetailDialog: React.FC<DialogProps> = (props) => {
  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Détails de l'échéance
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Vue d'ensemble de la situation de cette assignation financière.
          </DialogDescription>
        </DialogHeader>

        {/* Grid de données clés, ultra propre sans boîte ou bordure inutile */}
        <div className="py-2 space-y-3.5 text-sm">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <span className="text-muted-foreground text-xs">Montant total</span>
            <span className="font-mono font-semibold text-foreground">
              150 000 FCFA
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <span className="text-muted-foreground text-xs">Montant payé</span>
            <span className="font-mono font-medium text-emerald-600 dark:text-emerald-500">
              100 000 FCFA
            </span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <span className="text-muted-foreground text-xs">
              Reste à recouvrer
            </span>
            <span className="font-mono font-medium text-rose-600 dark:text-rose-500">
              50 000 FCFA
            </span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs font-medium"
            >
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ==========================================================================
   3. ENREGISTRER UN PAIEMENT (DIALOGFORM + HOOK FORM)
   ========================================================================== */
export const SavePaymentDialog: React.FC<
  DialogProps & {
    assignmentId: string;
    schoolId: string;
    yearId: string;
  } & ProcessPaymentFormConfig
> = ({ assignmentId, schoolId, yearId, mutationKey, onSuccess, ...props }) => {
  const {
    currencyOptions,
    formId,
    isSubmitting,
    paymentMethodOptions,
    onSubmit,
  } = useProcessStudentPaymentForm(
    { schoolId, yearId },
    { mutationKey, onSuccess },
  );

  return (
    <DialogForm
      formId={formId}
      title="Enregistrer un paiement"
      description="Saisissez le montant perçu et le mode de règlement pour mettre à jour le solde."
      submitText={isSubmitting ? "Traitement..." : "Enregistrer le paiement"}
      {...props}
    >
      <PaymentProcessForm
        formId={formId}
        currencyOptions={currencyOptions}
        paymentMethodOptions={paymentMethodOptions}
        onSubmit={onSubmit}
        defaultValues={{ schoolId, yearId, assignmentId }}
      />
    </DialogForm>
  );
};
