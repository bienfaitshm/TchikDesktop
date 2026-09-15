import {
  FeeAssignmentTDO,
  SelectOption,
} from "@/packages/@core/data-access/db";

/**
 * Represents a generic UI select option payload combined with custom domain data.
 */
export type Option<T = unknown> = SelectOption & {
  value: string;
  label: string;
} & T;

/**
 * Represents a grouped collection of UI options with an optional section heading.
 */
export type OptionGroup<T = unknown> = {
  heading?: string;
  options: Option<T>[];
};

/**
 * Groups fee assignments by their fee type name into a list of UI option groups.
 * @param assignments - Array of fee assignments to be categorized.
 * @returns An array of option groups formatted for UI select components.
 */
export function groupFeeAssignmentsByTypeName(
  assignments: FeeAssignmentTDO[],
): OptionGroup<FeeAssignmentTDO>[] {
  const DEFAULT_CATEGORY = "Uncategorized";

  const groupedAssignments = assignments.reduce<
    Record<string, Option<FeeAssignmentTDO>[]>
  >((accumulator, assignment) => {
    const rawName = assignment.feeType?.name;
    const categoryKey =
      rawName && rawName.trim().length > 0 ? rawName.trim() : DEFAULT_CATEGORY;

    if (!accumulator[categoryKey]) {
      accumulator[categoryKey] = [];
    }

    const optionItem: Option<FeeAssignmentTDO> = {
      ...assignment,
      value: String(assignment.assignmentId ?? ""),
      label: assignment.feeSchedule.installmentName,
    };

    accumulator[categoryKey].push(optionItem);
    return accumulator;
  }, {});

  return Object.entries(groupedAssignments).map(([heading, options]) => ({
    heading,
    options,
  }));
}
