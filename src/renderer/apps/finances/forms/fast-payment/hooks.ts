import { create } from "zustand";
import { EnrollmentOption } from "./types";

interface FastPaymentState {
  selectedStudent: EnrollmentOption | null;
  selectedFeeTypeId: string | null;
  selectedScheduleId: string | null;
  setSelectedStudent: (student: EnrollmentOption | null) => void;
  setSelectedFeeTypeId: (feeTypeId: string | null) => void;
  setSelectedScheduleId: (scheduleId: string | null) => void;
  resetSelections: () => void;
}

/**
 * Zustand store managing fast payment workflow state and reactive resets.
 */
export const useFastPaymentStore = create<FastPaymentState>((set) => ({
  selectedStudent: null,
  selectedFeeTypeId: null,
  selectedScheduleId: null,
  setSelectedStudent: (student) =>
    set({
      selectedStudent: student,
      selectedFeeTypeId: null,
      selectedScheduleId: null,
    }),
  setSelectedFeeTypeId: (feeTypeId) =>
    set({
      selectedFeeTypeId: feeTypeId,
      selectedScheduleId: null,
    }),
  setSelectedScheduleId: (scheduleId) =>
    set({ selectedScheduleId: scheduleId }),
  resetSelections: () =>
    set({
      selectedStudent: null,
      selectedFeeTypeId: null,
      selectedScheduleId: null,
    }),
}));
