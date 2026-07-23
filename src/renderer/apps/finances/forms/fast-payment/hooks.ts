import { useState, useMemo, useCallback } from "react";
import type { EnrollmentPayment } from "@/packages/@core/data-access/db";
import type { EnrollmentOption, ScheduleOption } from "./types";

export function useFastPaymentState() {
  const [selectedStudent, setSelectedStudent] = useState<
    EnrollmentOption | undefined
  >();
  const [selectedFeeType, setSelectedFeeType] = useState<
    EnrollmentPayment | undefined
  >();
  const [selectedSchedule, setSelectedSchedule] = useState<
    ScheduleOption | undefined
  >();

  const handleStudentChange = useCallback(
    (_: string, student?: EnrollmentOption) => {
      setSelectedStudent(student);
      setSelectedFeeType(undefined);
      setSelectedSchedule(undefined);
    },
    [],
  );

  const handleFeeTypeChange = useCallback((feeType?: EnrollmentPayment) => {
    setSelectedFeeType(feeType);
    setSelectedSchedule(undefined);
  }, []);

  const handleScheduleChange = useCallback((schedule?: ScheduleOption) => {
    setSelectedSchedule(schedule);
  }, []);

  const amountDue = useMemo(() => {
    if (!selectedSchedule) return 0;
    return Math.max(
      0,
      selectedSchedule.totalAmount - selectedSchedule.amountPaid,
    );
  }, [selectedSchedule]);

  const isValidForSubmission = useMemo(() => {
    return Boolean(selectedSchedule) && amountDue > 0;
  }, [selectedSchedule, amountDue]);

  return {
    selectedStudent,
    selectedFeeType,
    selectedSchedule,
    amountDue,
    isValidForSubmission,
    handleStudentChange,
    handleFeeTypeChange,
    handleScheduleChange,
  };
}
