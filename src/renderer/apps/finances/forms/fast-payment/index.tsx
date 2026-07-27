"use client";

import { Suspense, useCallback } from "react";
import { CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { StudentSearch } from "./student-search";
import { FeeSelection } from "./fee-selection";
import { PaymentProcessForm } from "@/renderer/apps/finances/forms/payment-process-form";
import {
  EmptySelectStudent,
  FastPaymentLoading,
} from "@/renderer/apps/finances/components/fast-payment-empty";
import { useFastPaymentStore } from "./hooks";
import type { FastPaymentFormProps, FastPaymentSubmitter } from "./types";
import type { EnrollmentOption } from "./types";
import { PaymentButton } from "./payment-submit-button";

/**
 * Main fast payment form component managing POS checkout workflow.
 * Handles student selection, fee overview loading, payment submission, and live preview layout.
 *
 * @param props - Component properties including school/year context, payment options, and callbacks.
 * @returns Complete fast payment layout component.
 */
export function FastPaymentForm({
  schoolId,
  yearId,
  currencyOptions = [],
  paymentMethodOptions = [],
  onSubmit,
  formId,
  isSubmitting,
  school,
  yearName,
}: FastPaymentFormProps) {
  const { selectedStudent, setSelectedStudent, resetForm } =
    useFastPaymentStore(
      useShallow((state) => ({
        selectedStudent: state.selectedStudent,
        setSelectedStudent: state.setSelectedStudent,
        resetForm: state.resetForm,
      })),
    );

  const handleStudentChange = useCallback(
    (_: unknown, student?: EnrollmentOption) => {
      setSelectedStudent(student);
    },
    [setSelectedStudent],
  );

  const handleSubmit: FastPaymentSubmitter = useCallback(
    (payload, helpers) => {
      onSubmit(payload, {
        reset: (value) => {
          helpers.reset();
          resetForm(value, {
            name: school?.name ?? "—",
            address: school?.address ?? "—",
            yearName: yearName ?? "",
          });
        },
      });
    },
    [onSubmit, resetForm, school],
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-foreground">
          <CreditCard className="size-5 text-primary" />
          <h3 className="text-xl font-bold tracking-tight">
            Caisse : Paiement Rapide
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Enregistrez un encaissement direct et générez la facture
          instantanément.
        </p>
      </div>

      <div className="mt-6">
        <FieldGroup className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="student">Élève au guichet</FieldLabel>
            <StudentSearch
              id="student"
              schoolId={schoolId}
              yearId={yearId}
              enrollment={selectedStudent}
              onChange={handleStudentChange}
            />
            <FieldDescription className="text-xs text-muted-foreground">
              Apparaît sur les factures et reçus imprimés.
            </FieldDescription>
          </Field>

          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div
                key={selectedStudent.enrollmentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<FastPaymentLoading />}>
                  <FeeSelection enrollmentId={selectedStudent.enrollmentId}>
                    {({ amountPaid, assignmentId, totalAmount }) => (
                      <div className="mt-4">
                        <PaymentProcessForm
                          onSubmit={handleSubmit}
                          currencyOptions={currencyOptions}
                          paymentMethodOptions={paymentMethodOptions}
                          formId={formId}
                          defaultValues={{
                            schoolId,
                            yearId,
                            assignmentId,
                          }}
                          totalAmount={totalAmount}
                          amountPaid={amountPaid}
                        />
                      </div>
                    )}
                  </FeeSelection>
                </Suspense>
              </motion.div>
            ) : (
              <EmptySelectStudent />
            )}
          </AnimatePresence>
        </FieldGroup>
        <PaymentButton
          formId={formId}
          isSubmitting={isSubmitting}
          className="my-4"
          label="Valider l'encaissement"
        />
      </div>
    </div>
  );
}

export { InvoiceLivePreview } from "./invoice-live-preview";
export * from "./fastpayment-container";
export type { Ticket } from "./hooks";
