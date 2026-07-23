"use client";

import { Suspense, useCallback } from "react";
import { CreditCard, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";

import { StudentSearch } from "./student-search";
import { FeeSelection } from "./fee-selection";
import { InvoiceLivePreview } from "./invoice-live-preview";
import { PaymentProcessForm } from "@/renderer/apps/finances/forms/payment-process-form";
import {
  EmptySelectStudent,
  FastPaymentLoading,
} from "@/renderer/apps/finances/components/fast-payment-empty";
import { useFastPaymentState } from "./hooks";
import type { FastPaymentFormProps, FastPaymentSubmiter } from "./types";

export function FastPaymentForm({
  schoolId,
  yearId,
  currencyOptions = [],
  paymentMethodOptions = [],
  onSubmit,
  formId,
  isSubmitting,
  school,
}: FastPaymentFormProps) {
  const {
    selectedStudent,
    selectedFeeType,
    selectedSchedule,
    amountDue,
    isValidForSubmission,
    handleStudentChange,
    handleFeeTypeChange,
    handleScheduleChange,
    handleReset,
  } = useFastPaymentState();

  const handleSubmit: FastPaymentSubmiter = useCallback((payload, helpers) => {
    onSubmit(payload, {
      reset: (value) => {
        helpers.reset(value);
        handleReset();
      },
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-24 items-start">
      {/* Zone Formulaire */}
      <div className="lg:col-span-8 flex flex-col gap-6">
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
                      <FeeSelection
                        enrollmentId={selectedStudent.enrollmentId}
                        selectedFeeType={selectedFeeType}
                        onFeeTypeChange={handleFeeTypeChange}
                        selectedSchedule={selectedSchedule}
                        onScheduleChange={handleScheduleChange}
                      >
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

            <LoadingButton
              type="submit"
              form={formId}
              className="w-full font-semibold tracking-wide mt-6 transition-all"
              size="lg"
              disabled={!isValidForSubmission || isSubmitting}
              loading={isSubmitting}
            >
              <Receipt data-icon="inline-start" className="mr-2" /> Valider
              l'encaissement & Archiver
            </LoadingButton>
          </div>
        </div>
      </div>

      {/* Zone Reçu / Live Preview */}
      <div className="lg:col-span-4">
        <InvoiceLivePreview
          school={school}
          selectedStudent={selectedStudent}
          selectedFeeType={selectedFeeType}
          selectedSchedule={selectedSchedule}
          amountDue={amountDue}
        />
      </div>
    </div>
  );
}
