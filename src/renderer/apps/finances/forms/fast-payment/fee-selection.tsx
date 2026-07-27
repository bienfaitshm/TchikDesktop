"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  ComboboxSearch,
  RenderItem,
} from "@/components/form/fields/generic-search-combo-box";
import { useGetStudentPaymentOverview } from "@/renderer/libs/queries/finances";
import {
  EmptySelect,
  PaymentOverview,
} from "@/renderer/apps/finances/components/fast-payment-empty";
import { formatScheduleStatus } from "./formatters";
import { useFastPaymentStore } from "./hooks";

/**
 * Arguments provided to the children render prop function.
 */
export type FeeSelectionChildrenArgs = {
  totalAmount: number;
  amountPaid: number;
  assignmentId: string;
};

/**
 * Props interface for the FeeSelection component.
 */
export type FeeSelectionProps = {
  /** Unique enrollment identifier for student payment query. */
  enrollmentId: string;
  /** Optional render prop children function to display schedule details. */
  children?: (defaultValue: FeeSelectionChildrenArgs) => React.ReactNode;
};

/**
 * Fee selection component handling fee type and schedule options.
 * Connects to payment store and displays selected schedule overview.
 *
 * @param props - Properties including enrollmentId and optional children render function.
 * @returns Interactive fee type and schedule selection UI component.
 */
export const FeeSelection = memo<FeeSelectionProps>(
  ({ enrollmentId, children }) => {
    const { data: feeOverview } = useGetStudentPaymentOverview(enrollmentId);

    const {
      selectedFeeType,
      selectedSchedule,
      setSelectedFeeType,
      setSelectedSchedule,
    } = useFastPaymentStore(
      useShallow((state) => ({
        selectedFeeType: state.selectedFeeType,
        selectedSchedule: state.selectedSchedule,
        setSelectedFeeType: state.setSelectedFeeType,
        setSelectedSchedule: state.setSelectedSchedule,
      })),
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Field className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="fee-type-select">Type de Frais</FieldLabel>
            <ComboboxSearch
              id="fee-type-select"
              selectedItem={selectedFeeType}
              value={selectedFeeType?.value}
              options={feeOverview?.payments ?? []}
              onChange={(_, feeType) => setSelectedFeeType(feeType)}
            />
          </Field>

          <Field className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="fee-schedule-select">
              Échéancier / Période
            </FieldLabel>
            <ComboboxSearch
              id="fee-schedule-select"
              selectedItem={selectedSchedule}
              value={selectedSchedule?.scheduleId}
              options={selectedFeeType?.schedules ?? []}
              onChange={(_, schedule) => setSelectedSchedule(schedule)}
              renderItem={({ label, status, amountPaid, totalAmount }) => (
                <RenderItem
                  label={label}
                  description={formatScheduleStatus(
                    status,
                    amountPaid,
                    totalAmount,
                  )}
                />
              )}
            />
          </Field>
        </div>

        <AnimatePresence mode="wait">
          {selectedSchedule ? (
            <PaymentOverview assignment={selectedSchedule}>
              <motion.div
                key={selectedSchedule.scheduleId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {children?.({
                  totalAmount: selectedSchedule.totalAmount,
                  amountPaid: selectedSchedule.amountPaid,
                  assignmentId: selectedSchedule.assignmentId,
                })}
              </motion.div>
            </PaymentOverview>
          ) : (
            <EmptySelect />
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

FeeSelection.displayName = "FeeSelection";
