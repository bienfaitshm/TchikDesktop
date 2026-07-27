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

// ---------------------------------------------------------------------------
// UTILITAIRE : Génération aléatoire de la référence
// ---------------------------------------------------------------------------
export const generateTicketRef = (year = new Date().getFullYear()): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPart += characters.charAt(randomIndex);
  }
  return `POS-${year}-${randomPart}`;
};

type ReturnDataPayment = FeeAssignment & {
  payment: StudentPayment;
};

export type Ticket = {
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

// --- STATE SHAPE ---
export type FastPaymentState = {
  tickets: Ticket[];
  selectedStudent: EnrollmentOption | undefined;
  selectedFeeType: EnrollmentPayment | undefined;
  selectedSchedule: ScheduleOption | undefined;
};

// --- ACTIONS SHAPE ---
export type FastPaymentActions = {
  setSelectedStudent: (student?: EnrollmentOption) => void;
  setSelectedFeeType: (feeType?: EnrollmentPayment) => void;
  setSelectedSchedule: (schedule?: ScheduleOption) => void;

  addTicket: (ticket: Ticket) => void;
  markTicketAsPrinted: (ticketRef: string) => void;
  clearTickets: () => void;

  resetForm: (
    data: ReturnDataPayment,
    school: { name: string; address: string; yearName: string },
  ) => void;
  resetAll: () => void;
};

export type FastPaymentStore = FastPaymentState & FastPaymentActions;

const initialState: FastPaymentState = {
  tickets: [],
  selectedStudent: undefined,
  selectedFeeType: undefined,
  selectedSchedule: undefined,
};

// --- LE STORE ---
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
            tickets: state.tickets.map((t) =>
              t.ticketRef === ticketRef ? { ...t, isPrinted: true } : t,
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
          selectedStudent?.student?.fullName ?? selectedStudent?.label ?? "—",
          data,
          school,
          {
            feeTypeName: selectedFeeType?.name ?? selectedFeeType?.label ?? "—",
            scheduleName:
              selectedSchedule?.installmentName ??
              selectedSchedule?.label ??
              "—",
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

// ---------------------------------------------------------------------------
// SÉLECTEURS PURS (Empêchent les boucles infinies de re-render)
// ---------------------------------------------------------------------------

export const selectAmountDue = (state: FastPaymentState): number => {
  if (!state.selectedSchedule) return 0;
  return Math.max(
    0,
    state.selectedSchedule.totalAmount - state.selectedSchedule.amountPaid,
  );
};

export const selectIsValidForSubmission = (
  state: FastPaymentState,
): boolean => {
  const amountDue = selectAmountDue(state);
  return Boolean(state.selectedSchedule) && amountDue > 0;
};

export const selectPreviewTicket = (
  state: FastPaymentState,
): Partial<Ticket> | undefined => {
  const { selectedStudent, selectedFeeType, selectedSchedule, tickets } = state;

  // 1. Si une sélection est active
  if (selectedStudent || selectedFeeType || selectedSchedule) {
    const amountDue = selectAmountDue(state);
    return {
      ticketRef: "POS-2026-PREV", // Reste fixe pour le preview pour éviter de changer à chaque rendu
      studentName:
        selectedStudent?.student?.fullName ?? selectedStudent?.label ?? "—",
      feeTypeName: selectedFeeType?.label ?? selectedFeeType?.name ?? "—",
      scheduleName:
        selectedSchedule?.label ?? selectedSchedule?.installmentName ?? "—",
      amountPaid: amountDue,
      totalDue: selectedSchedule?.totalAmount ?? 0,
      isPrinted: false,
    };
  }

  // 2. Sinon, retourner le dernier ticket non imprimé
  const lastTicket = tickets[0];
  if (lastTicket && !lastTicket.isPrinted) {
    return lastTicket;
  }

  return undefined;
};

function createTicket(
  studentName: string,
  payment: ReturnDataPayment,
  school: { name: string; address: string; yearName: string },
  fee: { feeTypeName: string; scheduleName: string },
): Ticket {
  return {
    address: school.address,
    schoolName: school.name,
    amountPaid: payment.payment.amountReceived,
    currency: payment.payment.currencyReceived,
    paymentMethod: payment.payment.paymentMethod,
    transactionReference: payment.payment.transactionReference,
    studentName,
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
