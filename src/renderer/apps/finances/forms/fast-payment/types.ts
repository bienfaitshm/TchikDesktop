import type {
  EnrollmentDTO,
  School,
  EnrollmentPayment,
} from "@/packages/@core/data-access/db";
import type { ProcessStudentPaymentPayload } from "@/packages/@core/apis/clients/finances.payment";
import type { SelectOption } from "@/packages/drizzle-queries";
import { FormSubmitHandler } from "@/renderer/libs/queries/base";

/**
 * Selection option type combining select props with full enrollment DTO metadata.
 */
export type EnrollmentOption = SelectOption & EnrollmentDTO;

/**
 * Represents a single fee payment schedule item from an enrollment.
 */
export type ScheduleOption = EnrollmentPayment["schedules"][number];

/**
 * Callback handler type for submitting fast student payment payloads.
 */
export type FastPaymentSubmitter = FormSubmitHandler<
  ProcessStudentPaymentPayload,
  any
>;

/**
 * Props interface for the FastPaymentForm component.
 */
export type FastPaymentFormProps = {
  /** Unique school identifier context. */
  schoolId: string;
  /** Unique academic year identifier context. */
  yearId: string;
  /** Options available for currency selection. */
  currencyOptions?: SelectOption[];
  /** Options available for payment method selection. */
  paymentMethodOptions?: SelectOption[];
  /** Async handler function invoked on form submission. */
  onSubmit: FastPaymentSubmitter;
  /** Optional school details entity. */
  school?: School;
  /** Indicates if the form submission is currently in progress. */
  isSubmitting?: boolean;
  /** Optional HTML form ID attribute. */
  formId?: string;
};
