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
import { Suspense } from "@/renderer/libs/queries/suspense";
import { PaymentAssignHistory } from "../contents/payment-assign-hisotry.content";

type DialogProps = Partial<React.ComponentProps<typeof Dialog>> & {
  children?: React.ReactNode;
  schoolId?: string;
  yearId?: string;
  assignmentId: string;
};

/* ==========================================================================
   1. HISTORIQUE DES PAIEMENTS (MINIMALISTE TIMELINE)
   ========================================================================== */
export const FeeAssignmentPaymentHistoryDialog: React.FC<DialogProps> = ({
  assignmentId,
  ...props
}) => {
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
        <Suspense>
          <PaymentAssignHistory assignmentId={assignmentId} />
        </Suspense>

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
