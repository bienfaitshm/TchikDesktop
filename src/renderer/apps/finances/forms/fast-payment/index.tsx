"use client";

import React, { Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { FeeSelection } from "./fee-selection";
import { PaymentProcessForm } from "@/renderer/apps/finances/forms/payment-process-form";
import {
  EmptySelectStudent,
  FastPaymentLoading,
} from "@/renderer/apps/finances/components/fast-payment-empty";
import { generateInvoiceRef, useFastPaymentStore } from "./hooks";
import type { FastPaymentFormProps, FastPaymentSubmitter } from "./types";
import { useSearchEnrollments } from "@/renderer/libs/queries/enrollements/helpers";
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";

/**
 * Main fast payment form component managing POS checkout workflow.
 * Renders student selection combobox and embeds fee selection and payment sub-forms.
 *
 * @param props - Form configuration including school context, payment options, and submission handler.
 * @returns The fast payment layout component JSX.
 */
export function FastPaymentForm({
  schoolId,
  yearId,
  currencyOptions = [],
  paymentMethodOptions = [],
  onSubmit,
  formId,
}: FastPaymentFormProps): React.JSX.Element {
  const searchStudent = useSearchEnrollments({
    schoolId,
    yearId,
  });

  const selectedStudent = useFastPaymentStore((store) => store.selectedStudent);
  const handleStudentChange = useFastPaymentStore(
    (store) => store.setSelectedStudent,
  );

  const transactionReference = useMemo(
    () => generateInvoiceRef(),
    [selectedStudent?.enrollmentId],
  );

  return (
    <div className="mt-6 space-y-5">
      <FieldGroup className="flex flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="student">Élève au guichet</FieldLabel>
          <ComboboxSearch
            placeholder="Sélectionner l'élève"
            options={searchStudent.options}
            selectedItem={selectedStudent}
            value={selectedStudent?.value}
            onChange={(_, enrollment) => handleStudentChange(enrollment)}
            search={searchStudent.searchQuery}
            isLoading={searchStudent.isSearching}
            onSearchChange={searchStudent.setSearchQuery}
            searchPlaceholder="Rechercher par nom, code..."
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
                        onSubmit={onSubmit}
                        currencyOptions={currencyOptions}
                        paymentMethodOptions={paymentMethodOptions}
                        formId={formId}
                        defaultValues={{
                          schoolId,
                          yearId,
                          assignmentId,
                          transactionReference,
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
    </div>
  );
}
