import { describe, it, expect, vi } from "vitest";
import { buildDynamicTemplateData } from "./payment-transform";
import { CURRENCY_ENUM } from "@/packages/@core/data-access/db";

vi.mock("@/packages/currency", () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
}));

describe("buildDynamicTemplateData", () => {
  it("should correctly build dynamic template data with nominal values", () => {
    const input = {
      school: { id: "1", name: "Test School" },
      classrooms: [
        {
          identifier: "Class 1A",
          shortIdentifier: "1A",
          enrollments: [
            {
              student: {
                fullName: "John Doe",
                firstName: "John",
                lastName: "Doe",
              },
              isProDeo: false,
              status: "ACTIVE",
              feeAssignments: [
                {
                  scheduleId: "sch-1",
                  totalPaid: 100,
                  currency: CURRENCY_ENUM.CDF,
                  status: "PAID",
                },
              ],
            },
          ],
        },
      ],
      feetypes: [
        {
          name: "Tuition",
          schedules: [
            { scheduleId: "sch-1", installmentName: "First Trimester" },
          ],
        },
      ],
    };

    const result = buildDynamicTemplateData(input);

    expect(result.school).toEqual(input.school);
    expect(result.classesView).toHaveLength(1);
    expect(result.classesView[0].name).toBe("Class 1A");
    expect(result.classesView[0].rowValues[0].feeTypeName).toBe("Tuition");
    expect(result.classesView[0].rowValues[0].headers).toEqual([
      "First Trimester",
    ]);
    expect(result.classesView[0].rowValues[0].rows[0]).toEqual({
      no: 1,
      name: "John Doe",
      isProDeo: false,
      status: "ACTIVE",
      cells: [
        {
          value: "100 CDF",
          status: "PAID",
          currency: CURRENCY_ENUM.CDF,
        },
      ],
    });
  });

  it("should fall back to constructing full name from parts when fullName is missing", () => {
    const input = {
      school: { id: "1", name: "Test School" },
      classrooms: [
        {
          identifier: "Class 1B",
          shortIdentifier: "1B",
          enrollments: [
            {
              student: {
                firstName: "Alice",
                middleName: "Marie",
                lastName: "Smith",
              },
              isProDeo: true,
              status: "PENDING",
              feeAssignments: [],
            },
          ],
        },
      ],
      feetypes: [
        {
          name: "Registration",
          schedules: [{ scheduleId: "sch-2", installmentName: "Full" }],
        },
      ],
    };

    const result = buildDynamicTemplateData(input);
    expect(result.classesView[0].rowValues[0].rows[0].name).toBe(
      "Smith Marie Alice",
    );
  });

  it("should handle edge cases where amount is zero, undefined, or missing", () => {
    const input = {
      school: { id: "1", name: "Test School" },
      classrooms: [
        {
          identifier: "Class 1C",
          shortIdentifier: "1C",
          enrollments: [
            {
              student: { fullName: "Bob Brown" },
              isProDeo: false,
              status: "ACTIVE",
              feeAssignments: [
                {
                  scheduleId: "sch-3",
                  totalPaid: 0,
                  currency: CURRENCY_ENUM.CDF,
                  status: "UNPAID",
                },
              ],
            },
          ],
        },
      ],
      feetypes: [
        {
          name: "Exam Fee",
          schedules: [{ scheduleId: "sch-3", installmentName: "Exams" }],
        },
      ],
    };

    const result = buildDynamicTemplateData(input);
    expect(result.classesView[0].rowValues[0].rows[0].cells[0].value).toBe("");
  });
});
