import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  EnrollmentPayment,
  FeeAssignment,
  StudentPayment,
} from "@/packages/@core/data-access/db";
import {
  FEE_SCHEDULES_ENUM,
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import type { EnrollmentOption, ScheduleOption } from "./types";

/**
 * Payment transaction result containing fee assignment and associated student payment.
 */
export type ReturnDataPayment = FeeAssignment & {
  payment: StudentPayment;
};

/**
 * Encapsulates demographic and identification data for a student receipt ticket.
 */
export type TicketStudent = {
  name: string;
  code: string;
  classroomName: string;
};

/**
 * Encapsulates financial and transactional metadata for a payment receipt.
 */
export type TicketPayment = {
  paymentId: string;
  feeTypeName: string;
  scheduleName: string;
  status: FEE_SCHEDULES_ENUM;
  currency: CURRENCY_ENUM;
  amountPaid: number;
  totalDue: number;
  paymentMethod: PAYMENT_METHOD_ENUM;
  transactionReference: string | null;
};

/**
 * Represents a normalized point-of-sale receipt ticket entity.
 */
export type Ticket = {
  invoiceRef: string;
  student: TicketStudent;
  payment: TicketPayment;
  date?: Date;
  isPrinted: boolean;
  isModePreview: boolean;
};

/**
 * State properties for the fast payment point-of-sale workflow.
 */
export type FastPaymentState = {
  tickets: Ticket[];
  selectedStudent: EnrollmentOption | undefined;
  selectedFeeType: EnrollmentPayment | undefined;
  selectedSchedule: ScheduleOption | undefined;
};

/**
 * Actions available to mutate the fast payment store state.
 */
export type FastPaymentActions = {
  setSelectedStudent: (student?: EnrollmentOption) => void;
  setSelectedFeeType: (feeType?: EnrollmentPayment) => void;
  setSelectedSchedule: (schedule?: ScheduleOption) => void;
  addTicket: (ticket: Ticket) => void;
  markTicketAsPrinted: (invoiceRef: string) => void;
  clearTickets: () => void;
  resetForm: (data: ReturnDataPayment) => void;
  resetAll: () => void;
};

export type FastPaymentStore = FastPaymentState & FastPaymentActions;

/**
 * Extracts a human-readable student display name with a default fallback.
 * @param student - Optional student enrollment option.
 * @returns Resolved student name or fallback indicator.
 */
const getStudentDisplayName = (student?: EnrollmentOption): string =>
  student?.student?.fullName ?? student?.label ?? "—";

/**
 * Extracts a human-readable fee type display name with a default fallback.
 * @param feeType - Optional fee type enrollment payment.
 * @returns Resolved fee type name or fallback indicator.
 */
const getFeeTypeDisplayName = (feeType?: EnrollmentPayment): string =>
  feeType?.name ?? feeType?.label ?? "—";

/**
 * Extracts a human-readable schedule installment name with a default fallback.
 * @param schedule - Optional schedule option.
 * @returns Resolved schedule name or fallback indicator.
 */
const getScheduleDisplayName = (schedule?: ScheduleOption): string =>
  schedule?.installmentName ?? schedule?.label ?? "—";

/**
 * Generates a unique point-of-sale tracking reference code.
 * @param year - Reference calendar year for the invoice prefix.
 * @returns Formatted unique tracking reference identifier.
 */
export const generateInvoiceRef = (year = new Date().getFullYear()): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = new Uint8Array(4);

  if (
    typeof globalThis.crypto !== "undefined" &&
    globalThis.crypto.getRandomValues
  ) {
    globalThis.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 4; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const randomPart = Array.from(randomBytes)
    .map((byte) => chars[byte % chars.length])
    .join("");

  return `POS-${year}-${randomPart}`;
};

/**
 * Constructs a normalized ticket entity from student, payment, and fee metadata.
 * @param student - Student identification details.
 * @param payment - Transaction payment result payload.
 * @param fee - Fee type and schedule descriptive labels.
 * @returns Normalized Ticket object ready for storage or preview.
 */
export function createTicket(
  student: TicketStudent,
  payment: ReturnDataPayment,
  fee: { feeTypeName: string; scheduleName: string },
): Ticket {
  return {
    invoiceRef: generateInvoiceRef(),
    student,
    payment: {
      paymentId: payment.payment.paymentId,
      feeTypeName: fee.feeTypeName,
      scheduleName: fee.scheduleName,
      status: payment.status,
      currency: payment.payment.currencyReceived,
      amountPaid: payment.payment.amountReceived,
      totalDue: payment.totalAmount,
      paymentMethod: payment.payment.paymentMethod,
      transactionReference: payment.payment.transactionReference,
    },
    date: payment.createdAt,
    isPrinted: false,
    isModePreview: false,
  };
}

const initialState: FastPaymentState = {
  tickets: [],
  selectedStudent: undefined,
  selectedFeeType: undefined,
  selectedSchedule: undefined,
};

/**
 * Zustand reactive store managing point-of-sale checkout state and operations.
 */
export const useFastPaymentStore = create<FastPaymentStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSelectedStudent: (student) =>
        set(
          {
            selectedStudent: student,
            selectedFeeType: undefined,
            selectedSchedule: undefined,
          },
          false,
          "setSelectedStudent",
        ),

      setSelectedFeeType: (feeType) =>
        set(
          {
            selectedFeeType: feeType,
            selectedSchedule: undefined,
          },
          false,
          "setSelectedFeeType",
        ),

      setSelectedSchedule: (schedule) =>
        set(
          {
            selectedSchedule: schedule,
          },
          false,
          "setSelectedSchedule",
        ),

      addTicket: (ticket) =>
        set(
          (state) => ({
            tickets: [ticket, ...state.tickets],
          }),
          false,
          "addTicket",
        ),

      markTicketAsPrinted: (invoiceRef) =>
        set(
          (state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.invoiceRef === invoiceRef
                ? { ...ticket, isPrinted: true }
                : ticket,
            ),
          }),
          false,
          "markTicketAsPrinted",
        ),

      clearTickets: () => set({ tickets: [] }, false, "clearTickets"),

      resetForm: (data) => {
        const state = get();

        const ticket = createTicket(
          {
            name: getStudentDisplayName(state.selectedStudent),
            classroomName:
              state.selectedStudent?.classroom.shortIdentifier ?? "-",
            code: state.selectedStudent?.studentCode ?? "-",
          },
          data,
          {
            feeTypeName: getFeeTypeDisplayName(state.selectedFeeType),
            scheduleName: getScheduleDisplayName(state.selectedSchedule),
          },
        );

        set(
          (currentState) => ({
            tickets: [ticket, ...currentState.tickets],
            selectedStudent: undefined,
            selectedFeeType: undefined,
            selectedSchedule: undefined,
          }),
          false,
          "resetForm",
        );
      },

      resetAll: () => set(initialState, false, "resetAll"),
    }),
    { name: "FastPaymentStore" },
  ),
);

/**
 * Computes the remaining unpaid balance for the currently selected schedule.
 * @param state - Current fast payment store state snapshot.
 * @returns Remaining balance due as a non-negative number.
 */
export const selectAmountDue = (state: FastPaymentState): number => {
  if (!state.selectedSchedule) return 0;
  return Math.max(
    0,
    state.selectedSchedule.totalAmount - state.selectedSchedule.amountPaid,
  );
};

/**
 * Validates whether the active form selections allow checkout submission.
 * @param state - Current fast payment store state snapshot.
 * @returns True if a valid schedule with outstanding balance is selected.
 */
export const selectIsValidForSubmission = (
  state: FastPaymentState,
): boolean => {
  const amountDue = selectAmountDue(state);
  return Boolean(state.selectedSchedule) && amountDue > 0;
};

/**
 * Derives a live preview ticket or returns the latest generated receipt ticket.
 * This is a pure function. Do not use directly as a Zustand selector to avoid infinite renders.
 * @param state - Current fast payment store state snapshot.
 * @returns Partial or complete Ticket object for UI preview display.
 */
export const derivePreviewTicket = (
  state: FastPaymentState,
): Partial<Ticket> | undefined => {
  const { selectedStudent, selectedFeeType, selectedSchedule, tickets } = state;
  const currentYear = new Date().getFullYear();

  if (selectedStudent || selectedFeeType || selectedSchedule) {
    const amountDue = selectAmountDue(state);

    return {
      invoiceRef: `POS-${currentYear}-PREV`,
      student: {
        name: getStudentDisplayName(selectedStudent),
        classroomName: selectedStudent?.classroom.shortIdentifier ?? "-",
        code: selectedStudent?.studentCode ?? "-",
      },
      payment: {
        paymentId: "PREVIEW-ID",
        feeTypeName: getFeeTypeDisplayName(selectedFeeType),
        scheduleName: getScheduleDisplayName(selectedSchedule),
        status: FEE_SCHEDULES_ENUM.UNPAID,
        currency: CURRENCY_ENUM.USD,
        amountPaid: amountDue,
        totalDue: selectedSchedule?.totalAmount ?? 0,
        paymentMethod: PAYMENT_METHOD_ENUM.CASH,
        transactionReference: null,
      },
      isModePreview: true,
      isPrinted: false,
    };
  }

  return tickets[0];
};
