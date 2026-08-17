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
 * Contact and identification details for a student's legal guardian.
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
 * Essential student information required for an enrollment receipt.
 */
export type StudentDetails = {
  /** Full name of the enrolled student. */
  name: string;
  /** Unique identification code for the student. */
  code: string;
  /** Optional classroom or section identifier. */
  classroom?: string;
  /** Optional details of the student's legal guardian. */
  guardian?: GuardianDetails;
};

/**
 * Properties for the EnrollmentInvoice component.
 */
export type EnrollmentInvoiceProps = {
  /** Student details to be printed on the invoice. */
  student: StudentDetails;
  /** Optional guardian details override or direct parameter. */
  guardian?: GuardianDetails;
  /** Optional title override for the receipt header. */
  title?: string;
  /** Optional custom reference string for the transaction. */
  invoiceRef?: string;
  /** Optional issuance date of the enrollment. */
  date?: string | Date | null;
};

/**
 * Helper properties for rendering a single key-value row.
 */
interface DetailRowProps {
  /** Label describing the field. */
  label: string;
  /** Value content to display. */
  value: string;
  /** Optional flag to apply bold font weight. */
  isBold?: boolean;
  /** Optional flag to apply text truncation. */
  isTruncated?: boolean;
}

/**
 * Renders a standardized key-value row with label and formatted value text.
 * @param props - Configuration properties for the detail row.
 * @returns A structured key-value JSX element.
 */
function DetailRow({
  label,
  value,
  isBold = false,
  isTruncated = false,
}: DetailRowProps): React.JSX.Element {
  const valueClass = [
    isBold ? "font-bold" : "",
    isTruncated ? "truncate max-w-48" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <KeyValueRow>
      <KeyLabel>{label}</KeyLabel>
      <ValueText className={valueClass || undefined}>{value}</ValueText>
    </KeyValueRow>
  );
}

/**
 * Renders a structured enrollment receipt displaying student and guardian details.
 * @param props - Component properties containing student info, guardian info, and invoice overrides.
 * @returns A formatted invoice ticket component for student enrollment.
 */
export function EnrollmentInvoice({
  student,
  guardian: guardianProp,
  title = "Reçu d'inscription",
  invoiceRef,
  date,
}: EnrollmentInvoiceProps): React.JSX.Element {
  const activeGuardian = guardianProp ?? student.guardian;

  return (
    <InvoiceContainer title={title} invoiceRef={invoiceRef} date={date}>
      <div className="text-xs flex flex-col gap-1">
        <RowTitle>Identité de l'élève</RowTitle>
        <DetailRow label="NOM :" value={student.name} isBold isTruncated />
        <DetailRow label="CODE :" value={student.code} />
        {student.classroom && (
          <DetailRow label="CLASSE :" value={student.classroom} />
        )}

        {activeGuardian && (
          <>
            <DashedDivider className="my-1" />
            <RowTitle>Identité du tuteur</RowTitle>
            {activeGuardian.name && (
              <DetailRow
                label="NOM :"
                value={activeGuardian.name}
                isBold
                isTruncated
              />
            )}
            {activeGuardian.phone && (
              <DetailRow label="TÉL :" value={activeGuardian.phone} />
            )}
            {activeGuardian.address && (
              <DetailRow
                label="ADRESSE :"
                value={activeGuardian.address}
                isTruncated
              />
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
}
