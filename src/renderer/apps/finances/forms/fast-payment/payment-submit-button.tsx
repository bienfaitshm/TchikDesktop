"use client";

import { memo } from "react";
import { Receipt } from "lucide-react";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { useFastPaymentStore, selectIsValidForSubmission } from "./hooks";
import { cn } from "@/renderer/utils";

/**
 * Props interface for the PaymentButton component.
 */
export type PaymentButtonProps = {
  /** The target form ID to which the submit button is attached. */
  formId?: string;
  /** Indicates whether the payment form is currently submitting. */
  isSubmitting?: boolean;
  /** Explicit override to disable the button. */
  disabled?: boolean;
  /** Custom label displayed inside the button. */
  label?: string;
  /** Optional override for payment form validity state. */
  isValid?: boolean;
  /** Additional CSS class names. */
  className?: string;
};

/**
 * Submit button component for fast payment forms.
 * Evaluates payment validity from store or props and manages loading states.
 *
 * @param props - Component properties controlling form association, state, and labels.
 * @returns A styled interactive loading button for payment submission.
 */
export const PaymentButton = memo<PaymentButtonProps>(
  ({
    formId,
    isSubmitting = false,
    disabled = false,
    label = "Valider le paiement",
    isValid,
    className,
  }) => {
    const storeIsValid = useFastPaymentStore(selectIsValidForSubmission);
    const isFormValid = isValid ?? storeIsValid;

    const isButtonDisabled = disabled || !isFormValid || isSubmitting;

    return (
      <LoadingButton
        type="submit"
        form={formId}
        className={cn(
          "w-full font-semibold tracking-wide transition-all",
          className,
        )}
        size="lg"
        disabled={isButtonDisabled}
        loading={isSubmitting}
      >
        <Receipt className="mr-2 size-5" />
        <span>{label}</span>
      </LoadingButton>
    );
  },
);

PaymentButton.displayName = "PaymentButton";
