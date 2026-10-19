"use client";

import React, { useMemo } from "react";
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
import { EnrollmentOverviewProps } from "../../components/enrollment-overview";

export type FeeSelectionChildrenArgs = {
  totalAmount: number;
  amountPaid: number;
  assignmentId: string;
};

export type FeeSelectionProps = {
  enrollmentId: string;
  schoolId: string;
  yearId: string;
  studentOverview?: EnrollmentOverviewProps;
  children?: (args: FeeSelectionChildrenArgs) => React.ReactNode;
};

/**
 * Handles fee type and schedule selection, synchronizing state IDs
 * and deriving fresh overview data to prevent stale states.
 * @param props - Component configuration properties.
 * @returns The fee selection interface section.
 */
export function FeeSelection({
  enrollmentId,
  schoolId,
  yearId,
  studentOverview,
  children,
}: FeeSelectionProps): React.JSX.Element {
  const { data: feeOverview } = useGetStudentPaymentOverview(enrollmentId);

  const selectedFeeTypeId = useFastPaymentStore(
    (state) => state.selectedFeeTypeId,
  );
  const selectedScheduleId = useFastPaymentStore(
    (state) => state.selectedScheduleId,
  );
  const setSelectedFeeTypeId = useFastPaymentStore(
    (state) => state.setSelectedFeeTypeId,
  );
  const setSelectedScheduleId = useFastPaymentStore(
    (state) => state.setSelectedScheduleId,
  );

  const selectedFeeType = useMemo(() => {
    if (!feeOverview?.payments) return null;
    return (
      feeOverview.payments.find((fee) => fee.value === selectedFeeTypeId) ??
      null
    );
  }, [feeOverview, selectedFeeTypeId]);

  const selectedSchedule = useMemo(() => {
    if (!selectedFeeType?.schedules) return null;
    return (
      selectedFeeType.schedules.find(
        (schedule) => schedule.scheduleId === selectedScheduleId,
      ) ?? null
    );
  }, [selectedFeeType, selectedScheduleId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <Field className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="fee-type-select" className="text-xs">
            Type de Frais
          </FieldLabel>
          <ComboboxSearch
            id="fee-type-select"
            selectedItem={selectedFeeType}
            value={selectedFeeTypeId ?? undefined}
            options={feeOverview?.payments ?? []}
            onChange={(_, feeType) =>
              setSelectedFeeTypeId(feeType?.value ?? null)
            }
          />
        </Field>

        <Field className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="fee-schedule-select" className="text-xs">
            Échéancier / Période
          </FieldLabel>
          <ComboboxSearch
            id="fee-schedule-select"
            selectedItem={selectedSchedule}
            value={selectedScheduleId ?? undefined}
            options={selectedFeeType?.schedules ?? []}
            onChange={(_, schedule) =>
              setSelectedScheduleId(schedule?.scheduleId ?? null)
            }
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
            <PaymentOverview
              schoolId={schoolId}
              yearId={yearId}
              studentOverview={studentOverview}
              assignment={selectedSchedule}
            >
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
