"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Check,
  ChevronsUpDown,
  Receipt,
  CreditCard,
  Printer,
  Landmark,
  AlertTriangle,
} from "lucide-react";

import type {
  User as DrizzleUser,
  Classroom,
  ClassroomEnrollment,
} from "@/packages/@core/data-access/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ComboboxSearch } from "@/components/form/fields/generic-search-combo-box";

const FEE_TYPES = [
  { id: "minerval", label: "Minerval / Scolarité" },
  { id: "inscription", label: "Frais d'Inscription" },
  { id: "state_exam", label: "Frais d'Examen d'État" },
  { id: "uniform", label: "Uniforme & Écussons" },
] as const;

const SCHEDULES = [
  { id: "tranche_1", label: "1ère Tranche" },
  { id: "tranche_2", label: "2ème Tranche" },
  { id: "tranche_3", label: "3ème Tranche" },
  { id: "mensuel_sep", label: "Mensualité - Septembre" },
  { id: "mensuel_oct", label: "Mensualité - Octobre" },
  { id: "totalite", label: "Totalité de l'année" },
] as const;

interface StudentExtended extends DrizzleUser {
  enrollment?: ClassroomEnrollment & {
    classroom?: Classroom;
  };
}

const paymentFormSchema = z.object({
  studentId: z.string({ required_error: "Veuillez sélectionner un élève." }),
  feeType: z.string({ required_error: "Sélectionnez le type de frais." }),
  schedule: z.string({ required_error: "Sélectionnez l'échéancier." }),
  amountPaid: z.coerce.number().positive("Le montant doit être supérieur à 0"),
  referenceNumber: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export type FastPaymentFormProps = {
  enrollments: [];
};

export function FastPaymentForm({}: FastPaymentFormProps) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentExtended | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: "",
      feeType: "",
      schedule: "",
      amountPaid: 0,
      referenceNumber: "",
    },
  });

  const watchedAmount = form.watch("amountPaid");
  const watchedFeeType = form.watch("feeType");
  const watchedSchedule = form.watch("schedule");

  const handleStudentSelect = (student: StudentExtended) => {
    setSelectedStudent(student);
    form.setValue("studentId", student.userId);
    setOpenCombobox(false);
  };

  const onSubmit = async (data: PaymentFormValues) => {
    console.log("Transaction :", data);
    alert(`Paiement enregistré avec succès !`);
    form.reset();
    setSelectedStudent(null);
  };

  const feeTypeLabel = useMemo(
    () =>
      FEE_TYPES.find((f) => f.id === watchedFeeType)?.label ||
      "Non sélectionné",
    [watchedFeeType],
  );
  const scheduleLabel = useMemo(
    () =>
      SCHEDULES.find((s) => s.id === watchedSchedule)?.label || "Non spécifié",
    [watchedSchedule],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto items-start">
      {/* SECTION FORMULAIRE (7 Colonnes) */}
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <FieldGroup className="flex flex-col gap-5">
                  {/* RECHERCHE ÉLÈVE E */}
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field, fieldState: { error } }) => (
                      <Field
                        data-invalid={!!error}
                        className="flex flex-col gap-1.5"
                      >
                        <FieldLabel htmlFor="student-select">
                          Élève au guichet
                        </FieldLabel>
                        <ComboboxSearch
                          placeholder="Rechercher par nom, code..."
                          options={[]}
                          onChange={() => {}}
                        />
                        <FormMessage />
                      </Field>
                    )}
                  />

                  {/* PARAMETRES DE PAIEMENT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="feeType"
                      render={({ field, fieldState: { error } }) => (
                        <Field
                          data-invalid={!!error}
                          className="flex flex-col gap-1.5"
                        >
                          <FieldLabel htmlFor="fee-type">
                            Type de Frais
                          </FieldLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                id="fee-type"
                                aria-invalid={!!error}
                              >
                                <SelectValue placeholder="Choisir le type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FEE_TYPES.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </Field>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schedule"
                      render={({ field, fieldState: { error } }) => (
                        <Field
                          data-invalid={!!error}
                          className="flex flex-col gap-1.5"
                        >
                          <FieldLabel htmlFor="schedule-select">
                            Échéancier / Période
                          </FieldLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                id="schedule-select"
                                aria-invalid={!!error}
                              >
                                <SelectValue placeholder="Sélectionner la tranche" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCHEDULES.map((sch) => (
                                <SelectItem key={sch.id} value={sch.id}>
                                  {sch.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </Field>
                      )}
                    />
                  </div>

                  {/* MONTANT ET REF CAISSE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="amountPaid"
                        render={({ field, fieldState: { error } }) => (
                          <Field
                            data-invalid={!!error}
                            className="flex flex-col gap-1.5"
                          >
                            <FieldLabel htmlFor="amount-input">
                              Montant Versé
                            </FieldLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupInput
                                  id="amount-input"
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="text-right font-mono font-bold text-base text-primary"
                                  aria-invalid={!!error}
                                  {...field}
                                />
                                <InputGroupAddon>
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    USD
                                  </span>
                                </InputGroupAddon>
                              </InputGroup>
                            </FormControl>
                            <FormMessage />
                          </Field>
                        )}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name="referenceNumber"
                        render={({ field, fieldState: { error } }) => (
                          <Field
                            data-invalid={!!error}
                            className="flex flex-col gap-1.5"
                          >
                            <FieldLabel htmlFor="ref-input">
                              N° Bordereau / Réf
                            </FieldLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupInput
                                  id="ref-input"
                                  placeholder="Optionnel"
                                  className="font-mono text-xs uppercase"
                                  aria-invalid={!!error}
                                  {...field}
                                />
                              </InputGroup>
                            </FormControl>
                            <FormMessage />
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                </FieldGroup>

                <Button
                  type="submit"
                  className="w-full font-semibold tracking-wide mt-2"
                  size="lg"
                >
                  <Receipt data-icon="inline-start" /> Valider l'encaissement &
                  Archiver
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* SECTION FACTURE EN TEMPS RÉEL (5 Colonnes) */}
      <div className="lg:col-span-5">
        <Card className="border-dashed bg-slate-50/50 dark:bg-zinc-900/40 shadow-sm sticky top-6">
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
            {/* Header de la facture */}
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

            {/* Identité de l'élève */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Élève :</span>
                <span className="font-bold text-right text-foreground">
                  {selectedStudent
                    ? `${selectedStudent.lastName} ${selectedStudent.middleName} ${selectedStudent.firstName || ""}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code Permanent :</span>
                <span className="font-mono text-right">
                  {selectedStudent?.enrollment?.studentCode || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Classe / Option :</span>
                <span className="font-medium text-right text-foreground">
                  {selectedStudent?.enrollment?.classroom?.identifier || "—"}
                </span>
              </div>
            </div>

            <Separator className="border-dashed" />

            {/* Détails de la transaction financière */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-foreground">{feeTypeLabel}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">
                    Échéance : {scheduleLabel}
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-foreground">
                  {watchedAmount > 0
                    ? `${Number(watchedAmount).toFixed(2)} $`
                    : "0.00 $"}
                </span>
              </div>
            </div>

            <Separator className="border-neutral-300 dark:border-neutral-700 my-2" />

            {/* Total */}
            <div className="flex justify-between items-center bg-white dark:bg-black p-3 rounded-lg border shadow-xs">
              <span className="text-xs font-black uppercase tracking-wider text-foreground">
                Net Payé
              </span>
              <span className="font-mono font-black text-lg text-primary">
                {watchedAmount > 0
                  ? `${Number(watchedAmount).toFixed(2)} $`
                  : "0.00 $"}
              </span>
            </div>

            {/* Pied de reçu */}
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

          <CardFooter className="bg-muted/40 p-3 rounded-b-xl flex gap-2">
            <Button
              variant="outline"
              className="w-full text-xs h-8"
              disabled={!selectedStudent || watchedAmount <= 0}
              onClick={() => window.print()}
            >
              <Printer data-icon="inline-start" /> Imprimer Ticket
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
