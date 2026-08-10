import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
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
 * Contextual school information required for ticket issuance.
 */
export type SchoolContext = {
  name: string;
  address: string;
  yearName: string;
};

/**
 * Represents a point-of-sale receipt ticket entity.
 */
export type Ticket = {
  paymentId: string;
  classroomName: string;
  studentCode: string;
  ticketRef: string;
  schoolName: string;
  address: string;
  studentName: string;
  feeTypeName: string;
  scheduleName: string;
  status: FEE_SCHEDULES_ENUM;
  currency: CURRENCY_ENUM;
  amountPaid: number;
  totalDue: number;
  yearName: string;
  paymentMethod: PAYMENT_METHOD_ENUM;
  transactionReference: string | null;
  date?: Date;
  isPrinted: boolean;
};

/**
 * State properties for the fast payment POS process.
 */
export type FastPaymentState = {
  tickets: Ticket[];
  selectedStudent: EnrollmentOption | undefined;
  selectedFeeType: EnrollmentPayment | undefined;
  selectedSchedule: ScheduleOption | undefined;
};

/**
 * Available actions to update the fast payment store state.
 */
export type FastPaymentActions = {
  setSelectedStudent: (student?: EnrollmentOption) => void;
  setSelectedFeeType: (feeType?: EnrollmentPayment) => void;
  setSelectedSchedule: (schedule?: ScheduleOption) => void;

  addTicket: (ticket: Ticket) => void;
  markTicketAsPrinted: (ticketRef: string) => void;
  clearTickets: () => void;

  resetForm: (data: ReturnDataPayment, school: SchoolContext) => void;
  resetAll: () => void;
};

export type FastPaymentStore = FastPaymentState & FastPaymentActions;

/**
 * Extracts student display name with a default fallback value.
 * @param student - Selected student option.
 * @returns Human-readable student name.
 */
const getStudentDisplayName = (student?: EnrollmentOption): string =>
  student?.student?.fullName ?? student?.label ?? "—";

/**
 * Extracts fee type display name with a default fallback value.
 * @param feeType - Selected fee type option.
 * @returns Human-readable fee type name.
 */
const getFeeTypeDisplayName = (feeType?: EnrollmentPayment): string =>
  feeType?.name ?? feeType?.label ?? "—";

/**
 * Extracts schedule display name with a default fallback value.
 * @param schedule - Selected schedule option.
 * @returns Human-readable schedule installment name.
 */
const getScheduleDisplayName = (schedule?: ScheduleOption): string =>
  schedule?.installmentName ?? schedule?.label ?? "—";

/**
 * Generates a unique reference string for POS receipts using secure random bytes.
 * @param year - Reference year for prefix formatting (defaults to current year).
 * @returns Formatted reference string (e.g., POS-2026-A1B2).
 */
export const generateTicketRef = (year = new Date().getFullYear()): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = new Uint8Array(4);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 4; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += characters[randomBytes[i] % characters.length];
  }

  return `POS-${year}-${randomPart}`;
};

/**
 * Constructs a new Ticket object from payment response and active selection context.
 * @param studentName - Resolved student display name.
 * @param payment - Transaction payment result payload.
 * @param school - Active school context metadata.
 * @param fee - Fee type and schedule name metadata.
 * @returns Complete Ticket object ready for store persistence.
 */
function createTicket(
  student: { studentName: string; classroomName: string; code: string },
  payment: ReturnDataPayment,
  school: SchoolContext,
  fee: { feeTypeName: string; scheduleName: string },
): Ticket {
  return {
    paymentId: payment.payment.paymentId,
    classroomName: student.classroomName,
    address: school.address,
    schoolName: school.name,
    amountPaid: payment.payment.amountReceived,
    currency: payment.payment.currencyReceived,
    paymentMethod: payment.payment.paymentMethod,
    transactionReference: payment.payment.transactionReference,
    studentName: student.studentName,
    studentCode: student.code,
    feeTypeName: fee.feeTypeName,
    scheduleName: fee.scheduleName,
    status: payment.status,
    ticketRef: generateTicketRef(),
    totalDue: payment.totalAmount,
    yearName: school.yearName,
    date: payment.createdAt,
    isPrinted: false,
  };
}

const initialState: FastPaymentState = {
  tickets: [],
  selectedStudent: undefined,
  selectedFeeType: undefined,
  selectedSchedule: undefined,
};

/**
 * Zustand store managing point-of-sale fast payment workflow state.
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

      markTicketAsPrinted: (ticketRef) =>
        set(
          (state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.ticketRef === ticketRef
                ? { ...ticket, isPrinted: true }
                : ticket,
            ),
          }),
          false,
          "markTicketAsPrinted",
        ),

      clearTickets: () => set({ tickets: [] }, false, "clearTickets"),

      resetForm: (data, school) => {
        const {
          selectedFeeType,
          selectedSchedule,
          selectedStudent,
          addTicket,
        } = get();

        const ticket = createTicket(
          {
            studentName: getStudentDisplayName(selectedStudent),
            classroomName: selectedStudent?.classroom.identifier ?? "-",
            code: selectedStudent?.studentCode ?? "-",
          },
          data,
          school,
          {
            feeTypeName: getFeeTypeDisplayName(selectedFeeType),
            scheduleName: getScheduleDisplayName(selectedSchedule),
          },
        );

        addTicket(ticket);

        return set(
          {
            selectedStudent: undefined,
            selectedFeeType: undefined,
            selectedSchedule: undefined,
          },
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
 * Calculates remaining balance due for currently selected schedule.
 * @param state - Fast payment store state.
 * @returns Remaining balance amount (non-negative).
 */
export const selectAmountDue = (state: FastPaymentState): number => {
  if (!state.selectedSchedule) return 0;
  return Math.max(
    0,
    state.selectedSchedule.totalAmount - state.selectedSchedule.amountPaid,
  );
};

/**
 * Evaluates whether form selections are valid and ready for checkout.
 * @param state - Fast payment store state.
 * @returns True if schedule is selected and balance due > 0.
 */
export const selectIsValidForSubmission = (
  state: FastPaymentState,
): boolean => {
  const amountDue = selectAmountDue(state);
  return Boolean(state.selectedSchedule) && amountDue > 0;
};

/**
 * Pure selector generating preview data for the live ticket component.
 * @param state - Fast payment store state.
 * @returns Partial ticket preview or undefined.
 */
export const selectPreviewTicket = (
  state: FastPaymentState,
): Partial<Ticket> | undefined => {
  const { selectedStudent, selectedFeeType, selectedSchedule, tickets } = state;
  const currentYear = new Date().getFullYear();

  if (selectedStudent || selectedFeeType || selectedSchedule) {
    const amountDue = selectAmountDue(state);
    return {
      ticketRef: `POS-${currentYear}-PREV`,
      studentName: getStudentDisplayName(selectedStudent),
      feeTypeName: getFeeTypeDisplayName(selectedFeeType),
      scheduleName: getScheduleDisplayName(selectedSchedule),
      amountPaid: amountDue,
      totalDue: selectedSchedule?.totalAmount ?? 0,
      isPrinted: false,
    };
  }

  const lastTicket = tickets[0];
  if (lastTicket && !lastTicket.isPrinted) {
    return lastTicket;
  }

  return undefined;
};

/**
 * Performance-optimized React hook providing shallow-memoized ticket preview state.
 * Prevents redundant component re-renders during POS state updates.
 * @returns Shallow-compared ticket preview object or undefined.
 */
export const useFastPaymentPreviewTicket = (): Partial<Ticket> | undefined => {
  return useFastPaymentStore(useShallow(selectPreviewTicket));
};

/**
 * Performance-optimized React hook providing shallow-memoized form selections state.
 * @returns Shallow-compared active student, fee, and schedule selections.
 */
export const useFastPaymentFormState = () => {
  return useFastPaymentStore(
    useShallow((state) => ({
      selectedStudent: state.selectedStudent,
      selectedFeeType: state.selectedFeeType,
      selectedSchedule: state.selectedSchedule,
    })),
  );
};
