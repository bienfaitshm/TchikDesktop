import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { EnrollmentDTO } from "@/packages/@core/data-access/db";

/** Resulting payload for an enrollment record. */
export type ReturnDataEnrollment = EnrollmentDTO;

/** Extended enrollment entity tracked within the POS store. */
export type StoreEnrollment = ReturnDataEnrollment & {
  isPrinted: boolean;
  enrollmentRef: string;
};

/** State properties held by the enrollment POS store. */
export type EnrollmentState = {
  enrollments: StoreEnrollment[];
};

/** Action methods available to update the enrollment POS store state. */
export type EnrollmentActions = {
  addEnrollment: (enrollment: ReturnDataEnrollment) => void;
  markEnrollmentAsPrinted: (enrollmentRef: string) => void;
  clearEnrollments: () => void;
  resetAll: () => void;
};

export type EnrollmentStore = EnrollmentState & EnrollmentActions;

function createEnrollment(enrollment: ReturnDataEnrollment): StoreEnrollment {
  const currentYear = new Date().getFullYear();
  return {
    ...enrollment,
    enrollmentRef: generateEnrollmentRef(currentYear),
    isPrinted: false,
  };
}

/**
 * Generates a unique reference string for POS receipts using secure random bytes.
 * @param year - Reference year for prefix formatting (defaults to current year).
 * @returns Formatted reference string (e.g., POS-2026-A1B2).
 */
export const generateEnrollmentRef = (
  year = new Date().getFullYear(),
): string => {
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

const initialState: EnrollmentState = {
  enrollments: [],
};

/**
 * Zustand store managing point-of-sale fast payment workflow state.
 */
export const useEnrollmentStore = create<EnrollmentStore>()(
  devtools(
    (set) => ({
      ...initialState,

      addEnrollment: (enrollment) =>
        set(
          (state) => ({
            enrollments: [createEnrollment(enrollment), ...state.enrollments],
          }),
          false,
          "addEnrollment",
        ),

      markEnrollmentAsPrinted: (enrollmentId) =>
        set(
          (state) => ({
            enrollments: state.enrollments.map((item) =>
              enrollmentId === item.enrollmentId
                ? { ...item, isPrinted: true }
                : item,
            ),
          }),
          false,
          "markEnrollmentAsPrinted",
        ),

      clearEnrollments: () =>
        set({ enrollments: [] }, false, "clearEnrollments"),

      resetAll: () => set(initialState, false, "resetAll"),
    }),
    { name: "EnrollmentStore" },
  ),
);
