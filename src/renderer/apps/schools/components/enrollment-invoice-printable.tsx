"use client";

import { useGetEnrollmentById } from "@/renderer/libs/queries/enrollements";
import { EnrollmentInvoice } from "@/components/invoices/enrollment-invoice";
import { type Invoice } from "@/renderer/libs/invoice-preview-printing";

/**
 * Properties for the EnrollmentInvoiceContent component.
 */
interface EnrollmentInvoiceContentProps {
  /** The invoice record to render. */
  invoice: Invoice;
}

/**
 * Renders the specific details and metadata of an enrollment invoice.
 * @param props - Properties containing the invoice record.
 * @returns The rendered enrollment invoice component.
 */
export function EnrollmentInvoiceContent({
  invoice,
}: EnrollmentInvoiceContentProps): React.JSX.Element {
  const { data: enrollment } = useGetEnrollmentById(invoice.id);

  const guardianData = enrollment?.tutor
    ? {
        name: enrollment.tutor.fullName,
        phone: enrollment.tutor.phoneNumber ?? "-",
        address: enrollment.tutor.address ?? "-",
      }
    : undefined;

  return (
    <EnrollmentInvoice
      student={{
        code: enrollment?.studentCode ?? invoice.invoiceRef,
        name: enrollment?.student?.fullName ?? "",
        classroom: enrollment?.classroom?.shortIdentifier ?? "",
      }}
      guardian={guardianData}
      invoiceRef={invoice.invoiceRef}
    />
  );
}
