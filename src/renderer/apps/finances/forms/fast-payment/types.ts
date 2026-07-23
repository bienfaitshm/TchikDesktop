import type {
  EnrollmentDTO,
  School,
  EnrollmentPayment,
} from "@/packages/@core/data-access/db";
import type { ProcessStudentPaymentPayload } from "@/packages/@core/apis/clients/finances.payment";
import type { SelectOption } from "@/packages/drizzle-queries";

export type Option = { label: string; value: string };

export type EnrollmentOption = SelectOption & EnrollmentDTO;
export type ScheduleOption = EnrollmentPayment["schedules"][number];

export type FastPaymentFormProps = {
  schoolId: string;
  yearId: string;
  currencyOptions?: Option[];
  paymentMethodOptions?: Option[];
  onSubmit: (payload: ProcessStudentPaymentPayload) => void;
  school?: School;
  isSubmitting?: boolean;
  formId?: string;
};
