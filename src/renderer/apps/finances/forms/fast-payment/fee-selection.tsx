"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  /** Total calculated amount for the selected fee schedule. */
  totalAmount: number;
  /** Cumulative amount already paid for the selected fee schedule. */
  amountPaid: number;
  /** Unique assignment identifier associated with the schedule. */
  assignmentId: string;
};

/**
 * Props interface for the FeeSelection component.
 */
export type FeeSelectionProps = {
  /** Unique enrollment identifier for student payment query. */
  enrollmentId: string;
  /** Optional render prop function to render contextual payment forms or actions. */
  children?: (args: FeeSelectionChildrenArgs) => React.ReactNode;
};

/**
 * Fee selection component handling fee type and schedule option selection.
 * Synchronizes selected options with the payment store and renders overview details.
 *
 * @param props - Component properties including enrollmentId and children render prop.
 * @returns The fee selection UI section.
 */
export function FeeSelection({ enrollmentId, children }: FeeSelectionProps) {
  const { data: feeOverview } = useGetStudentPaymentOverview(enrollmentId);
  const selectedFeeType = useFastPaymentStore((state) => state.selectedFeeType);
  const selectedSchedule = useFastPaymentStore(
    (state) => state.selectedSchedule,
  );
  const setSelectedFeeType = useFastPaymentStore(
    (state) => state.setSelectedFeeType,
  );
  const setSelectedSchedule = useFastPaymentStore(
    (state) => state.setSelectedSchedule,
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
            onChange={(_, schedule) => setSelectedSchedule?.(schedule)}
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
          <motion.div
            key={selectedSchedule.scheduleId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <PaymentOverview assignment={selectedSchedule}>
              {children?.({
                totalAmount: selectedSchedule.totalAmount,
                amountPaid: selectedSchedule.amountPaid,
                assignmentId: selectedSchedule.assignmentId,
              })}
            </PaymentOverview>
          </motion.div>
        ) : (
          <EmptySelect key="empty-fee-schedule-select" />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
