import { BusinessRuleError } from "./errors";

export function validateContext(
  schoolId?: string,
  yearId?: string,
): asserts schoolId is string {
  if (!schoolId || !yearId) {
    throw new BusinessRuleError(
      "Missing Context: schoolId and yearId are required.",
      "INVALID_CONTEXT",
    );
  }
}

export function getLocalDateString(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

export function buildAssignmentKey(
  enrollmentId: string,
  feeConfigId: string,
  scheduleId: string,
): string {
  return `${enrollmentId}-${feeConfigId}-${scheduleId}`;
}

export function extractRequiredAssignments(configs: any[]) {
  return configs.flatMap((config) => {
    const schedules = config.feeType?.schedules || [];
    return schedules.map((schedule: any) => ({
      feeConfigId: config.feeConfigId,
      scheduleId: schedule.scheduleId,
    }));
  });
}
