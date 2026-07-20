"use client";

import React, { useState } from "react";
import { Receipt, CreditCard, Landmark, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { EnrollmentDTO } from "@/packages/@core/data-access/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ComboboxSearch,
  RenderItem,
} from "@/components/form/fields/generic-search-combo-box";
import { useSearchEnrollments } from "@/renderer/libs/queries/enrollements/helpers";
import type { SelectOption } from "@/packages/drizzle-queries";
import { PaymentProcessForm } from "./payment-process-form";
import { useGetStudentPaymentOverview } from "@/renderer/libs/queries/finances";
import { Suspense } from "@/renderer/libs/queries/suspense";
import type { EnrollmentPayment } from "@/packages/@core/data-access/db";

export type FastPaymentFormProps = {
  schoolId: string;
  yearId: string;
};

export type StudentSearchProps = Pick<
  FastPaymentFormProps,
  "schoolId" | "yearId"
> & {
  enrollment?: SelectOption & EnrollmentDTO;
  onChange?: (
    enrollmentId: string,
    enrollment?: SelectOption & EnrollmentDTO,
  ) => void;
  value?: string;
};

/**
 * Renders a searchable combobox to find and select a student enrollment.
 * @param props - Component properties containing context IDs and change handlers.
 * @returns The student search combobox element.
 */
export const StudentSearch: React.FC<StudentSearchProps> = ({
  schoolId,
  yearId,
  onChange,
  value,
  enrollment,
}) => {
  const { isSearching, options, searchQuery, setSearchQuery } =
    useSearchEnrollments({ schoolId, yearId });

  return (
    <ComboboxSearch
      placeholder="Sélectionner l'élève"
      options={options}
      selectedItem={enrollment}
      value={value}
      onChange={(enrollmentId, selectedItem) =>
        onChange?.(enrollmentId, selectedItem)
      }
      search={searchQuery}
      isLoading={isSearching}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Rechercher par nom, code..."
      renderItem={(item) => (
        <RenderItem
          label={item.label}
          description={`${item.student?.gender} - ${item.classroom.shortIdentifier}`}
        />
      )}
    />
  );
};

/**
 * Formats the fee schedule description based on its payment status.
 * @param status - The current payment status (e.g., "PAID", "PARTIAL").
 * @param amountPaid - The amount already paid.
 * @param totalAmount - The total amount required.
 * @returns A formatted string describing the payment status.
 */
function formatScheduleStatus(
  status: string,
  amountPaid: number,
  totalAmount: number,
): string {
  if (status === "PAID") {
    return "Payé";
  }
  if (status === "PARTIAL") {
    return `Avance de ${amountPaid.toFixed(2)}, Reste: ${(totalAmount - amountPaid).toFixed(2)}`;
  }
  return "Non payé";
}

export type FeeSelectionProps = {
  enrollmentId: string;
  selectedFeeType?: EnrollmentPayment;
  onFeeTypeChange: (feeType?: EnrollmentPayment) => void;
  selectedSchedule?: EnrollmentPayment["schedules"][0];
  onScheduleChange: (schedule?: EnrollmentPayment["schedules"][0]) => void;
  children?: (defaultValue: {
    totalAmount: number;
    amountPaid: number;
    assignmentId: string;
  }) => React.ReactNode;
};

/**
 * Provides animated dropdown selections for a student's fee types and associated schedules.
 * @param props - Component properties including state handlers and render children.
 * @returns The fee selection component.
 */
export const FeeSelection: React.FC<FeeSelectionProps> = ({
  enrollmentId,
  selectedFeeType,
  onFeeTypeChange,
  selectedSchedule,
  onScheduleChange,
  children,
}) => {
  const { data: feeOverview } = useGetStudentPaymentOverview(enrollmentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="fee-type">Type de Frais</FieldLabel>
          <ComboboxSearch
            selectedItem={selectedFeeType}
            value={selectedFeeType?.value}
            options={feeOverview.payments}
            onChange={(_, feeType) => {
              onFeeTypeChange(feeType);
              onScheduleChange(undefined);
            }}
          />
        </Field>

        <Field className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="fee-schedule">Échéancier / Période</FieldLabel>
          <ComboboxSearch
            selectedItem={selectedSchedule}
            value={selectedSchedule?.scheduleId}
            options={selectedFeeType?.schedules}
            onChange={(_, schedule) => {
              onScheduleChange(schedule);
            }}
            renderItem={({ label, status, amountPaid, totalAmount }) => (
              <RenderItem
                label={label}
                description={formatScheduleStatus(
                  status,
                  amountPaid,
                  totalAmount,
                )}
              />
            )}
          />
        </Field>
      </div>

      <AnimatePresence mode="wait">
        {selectedSchedule && (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children?.({
              totalAmount: selectedSchedule.totalAmount,
              amountPaid: selectedSchedule.amountPaid,
              assignmentId: selectedSchedule.assignmentId,
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Main form component for processing fast student payments, including an animated live invoice preview.
 * @param props - Component properties including school and academic year identifiers.
 * @returns The complete fast payment form interface.
 */
export function FastPaymentForm({ schoolId, yearId }: FastPaymentFormProps) {
  const [selectedStudent, setSelectedStudent] = useState<
    (SelectOption & EnrollmentDTO) | undefined
  >(undefined);
  const [selectedFeeType, setSelectedFeeType] = useState<
    EnrollmentPayment | undefined
  >(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<
    EnrollmentPayment["schedules"][0] | undefined
  >(undefined);

  const amountDue = selectedSchedule
    ? selectedSchedule.totalAmount - selectedSchedule.amountPaid
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto items-start">
      <div className="lg:col-span-7 flex flex-col gap-6">
        <Card className="border-muted shadow-md">
          <CardHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-foreground">
              <CreditCard className="size-5 text-primary" />
              <CardTitle className="text-xl font-bold tracking-tight">
                Caisse : Paiement Rapide
              </CardTitle>
            </div>
            <CardDescription>
              Enregistrez un encaissement direct et générez la facture
              instantanément.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div>
              <FieldGroup className="flex flex-col gap-5">
                <Field>
                  <FieldLabel htmlFor="student">Élève au guichet</FieldLabel>
                  <StudentSearch
                    schoolId={schoolId}
                    yearId={yearId}
                    enrollment={selectedStudent}
                    onChange={(_, enrollment) => {
                      setSelectedStudent(enrollment);
                      setSelectedFeeType(undefined);
                      setSelectedSchedule(undefined);
                    }}
                  />
                  <FieldDescription>
                    Apparaît sur les factures et reçus imprimés.
                  </FieldDescription>
                </Field>

                <AnimatePresence mode="wait">
                  {selectedStudent && (
                    <motion.div
                      key={selectedStudent.enrollmentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Suspense
                        fallback={
                          <p className="text-sm text-muted-foreground">
                            Chargement des frais...
                          </p>
                        }
                      >
                        <FeeSelection
                          enrollmentId={selectedStudent.enrollmentId}
                          selectedFeeType={selectedFeeType}
                          onFeeTypeChange={setSelectedFeeType}
                          selectedSchedule={selectedSchedule}
                          onScheduleChange={setSelectedSchedule}
                        >
                          {() => (
                            <div className="mt-4">
                              <PaymentProcessForm
                                onSubmit={() => {}}
                                currencyOptions={[]}
                                paymentMethodOptions={[]}
                                formId="fast-payment-form"
                                defaultValues={{}}
                                totalAmount={amountDue}
                              />
                            </div>
                          )}
                        </FeeSelection>
                      </Suspense>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FieldGroup>

              <Button
                type="submit"
                form="fast-payment-form"
                className="w-full font-semibold tracking-wide mt-6 transition-all"
                size="lg"
                disabled={!selectedSchedule || amountDue <= 0}
              >
                <Receipt data-icon="inline-start" className="mr-2" /> Valider
                l'encaissement & Archiver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card className="border-dashed bg-slate-50/50 dark:bg-zinc-900/40 shadow-sm sticky top-6 overflow-hidden">
          <CardHeader className="pb-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 font-mono tracking-tight text-[11px]"
              >
                APERÇU LIVE FACTURE
              </Badge>
              <Landmark className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 font-sans text-xs">
            <div className="text-center flex flex-col gap-1">
              <h3 className="font-extrabold text-sm tracking-wide uppercase text-foreground">
                Complexe Scolaire Excellence
              </h3>
              <p className="text-muted-foreground text-[10px]">
                12, Avenue de l'Église, Commune de la Gombe
              </p>
              <div className="text-[10px] font-mono text-muted-foreground pt-1">
                Date: {new Date().toLocaleDateString("fr-FR")}
              </div>
            </div>

            <Separator className="border-dashed" />

            <div className="flex flex-col gap-2 min-h-15">
              <AnimatePresence mode="popLayout">
                {selectedStudent ? (
                  <motion.div
                    key={selectedStudent.enrollmentId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Nom, Postnom et Prénom
                      </span>
                      <span className="font-bold text-right text-foreground">
                        {selectedStudent.student.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Code de l'élève :
                      </span>
                      <span className="font-mono text-right">
                        {selectedStudent.studentCode || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Classe / Option :
                      </span>
                      <span className="font-medium text-right text-foreground">
                        {selectedStudent.classroom?.shortIdentifier || "—"}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-student"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-full text-muted-foreground italic text-[11px]"
                  >
                    En attente de sélection d'un élève...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator className="border-dashed" />

            <div className="flex flex-col gap-2 min-h-10">
              <AnimatePresence mode="popLayout">
                {selectedFeeType && selectedSchedule && (
                  <motion.div
                    key={selectedSchedule.scheduleId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <p className="font-bold text-foreground">
                        {selectedFeeType.label}
                      </p>
                      <p className="text-muted-foreground text-[10px] mt-0.5">
                        Échéance : {selectedSchedule.label}
                      </p>
                    </div>
                    <motion.span
                      key={amountDue}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono font-bold text-sm text-foreground"
                    >
                      {amountDue > 0 ? `${amountDue.toFixed(2)} $` : "0.00 $"}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator className="border-neutral-300 dark:border-neutral-700 my-2" />

            <div className="flex justify-between items-center bg-white dark:bg-black p-3 rounded-lg border shadow-xs">
              <span className="text-xs font-black uppercase tracking-wider text-foreground">
                Net Payé
              </span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={amountDue}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-mono font-black text-lg text-primary"
                >
                  {amountDue > 0 ? `${amountDue.toFixed(2)} $` : "0.00 $"}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="text-center text-[10px] text-muted-foreground pt-2 flex flex-col gap-1">
              <p className="italic">
                Généré via Système de Facturation Instantanée
              </p>
              <p className="font-mono text-[9px]">ID Caisse: CAISSE_A_2026</p>
            </div>

            <Alert variant="warning" className="mt-2">
              <AlertTriangle className="size-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription className="text-[11px] leading-relaxed">
                Ce montant sera imputé immédiatement. Les transactions archivées
                ne sont plus modifiables sans droits d'administration.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="bg-muted/40 p-3 rounded-b-xl flex gap-2"></CardFooter>
        </Card>
      </div>
    </div>
  );
}
