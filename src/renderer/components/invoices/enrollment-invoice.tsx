import React from "react";
import {
  InvoiceContainer,
  KeyValueRow,
  KeyLabel,
  ValueText,
  DashedDivider,
  RowTitle,
} from "./base";

/**
 * Represents contact and identification details for a student's legal guardian.
 */
export type GuardianDetails = {
  /** Full name of the legal guardian. */
  name?: string;
  /** Primary contact phone number of the guardian. */
  phone?: string;
  /** Physical residential address of the guardian. */
  address?: string;
};

/**
 * Represents the essential student information required for an enrollment receipt.
 */
export type StudentDetails = {
  /** Full name of the enrolled student. */
  name: string;
  /** Unique identification code for the student. */
  code: string;
  /** Optional class or section identifier. */
  classroom?: string;
  /** Optional details of the student's legal guardian. */
  guardian?: GuardianDetails;
};

/**
 * Props for the EnrollmentInvoice component.
 */
export type EnrollmentInvoiceProps = {
  /** Student details to be printed on the invoice. */
  student: StudentDetails;
  /** Optional title override for the receipt header. */
  title?: string;
  /** Optional custom reference string for the transaction. */
  invoiceRef?: string;
  /** Optional issuance date of the enrollment. */
  date?: string | Date | null;
};

/**
 * Renders a structured enrollment invoice displaying student details, guardian info, and metadata.
 * @param props - Component properties containing student info and optional invoice overrides.
 * @returns A formatted invoice ticket component for student enrollment.
 */
export const EnrollmentInvoice: React.FC<EnrollmentInvoiceProps> = ({
  student,
  title = "Reçu d'inscription",
  invoiceRef,
  date,
}) => {
  const { guardian } = student;

  return (
    <InvoiceContainer title={title} invoiceRef={invoiceRef} date={date}>
      <div className="text-xs flex flex-col gap-1">
        <RowTitle>Identité de l'élève</RowTitle>
        <KeyValueRow>
          <KeyLabel>NOM :</KeyLabel>
          <ValueText className="font-bold truncate max-w-48">
            {student.name}
          </ValueText>
        </KeyValueRow>
        <KeyValueRow>
          <KeyLabel>CODE :</KeyLabel>
          <ValueText>{student.code}</ValueText>
        </KeyValueRow>
        {student.classroom && (
          <KeyValueRow>
            <KeyLabel>CLASSE :</KeyLabel>
            <ValueText>{student.classroom}</ValueText>
          </KeyValueRow>
        )}

        {guardian && (
          <>
            <DashedDivider className="my-1" />
            <RowTitle>Identité du tuteur</RowTitle>
            {guardian.name && (
              <KeyValueRow>
                <KeyLabel>NOM :</KeyLabel>
                <ValueText className="font-bold truncate max-w-48">
                  {guardian.name}
                </ValueText>
              </KeyValueRow>
            )}
            {guardian.phone && (
              <KeyValueRow>
                <KeyLabel>TÉL :</KeyLabel>
                <ValueText>{guardian.phone}</ValueText>
              </KeyValueRow>
            )}
            {guardian.address && (
              <KeyValueRow>
                <KeyLabel>ADRESSE :</KeyLabel>
                <ValueText className="truncate max-w-48">
                  {guardian.address}
                </ValueText>
              </KeyValueRow>
            )}
          </>
        )}
      </div>

      <DashedDivider className="my-1" />
      <p className="text-[10px] text-center text-slate-500 dark:text-zinc-400 italic pt-1">
        Merci d'avoir renouvelé votre confiance en notre établissement pour la
        formation de vos enfants.
      </p>
    </InvoiceContainer>
  );
};
