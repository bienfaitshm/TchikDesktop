import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeeSelection } from "./fee-selection";
import { useGetStudentPaymentOverview } from "@/renderer/libs/queries/finances";
import { useFastPaymentStore } from "./hooks";

vi.mock("@/renderer/libs/queries/finances", () => ({
  useGetStudentPaymentOverview: vi.fn(),
}));

vi.mock("./hooks", () => ({
  useFastPaymentStore: vi.fn(),
}));

describe("FeeSelection Component", () => {
  const mockSetSelectedFeeTypeId = vi.fn();
  const mockSetSelectedScheduleId = vi.fn();

  const mockOverviewData = {
    payments: [
      {
        value: "fee-1",
        label: "Minerval",
        schedules: [
          {
            scheduleId: "sch-1",
            label: "Janvier",
            totalAmount: 35000,
            amountPaid: 0,
            assignmentId: "assign-1",
            status: "UNPAID",
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useGetStudentPaymentOverview as any).mockReturnValue({
      data: mockOverviewData,
    });
  });

  it("renders fee type and schedule selectors correctly", () => {
    const storeState = {
      selectedFeeTypeId: null,
      selectedScheduleId: null,
      setSelectedFeeTypeId: mockSetSelectedFeeTypeId,
      setSelectedScheduleId: mockSetSelectedScheduleId,
    };

    (
      useFastPaymentStore as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((selector) => selector(storeState));

    render(
      <FeeSelection
        enrollmentId="enroll-1"
        schoolId="school-1"
        yearId="year-1"
      />,
    );

    expect(screen.getByText("Type de Frais")).toBeDefined();
    expect(screen.getByText("Échéancier / Période")).toBeDefined();
  });

  it("derives active schedule correctly when ID matches overview data", () => {
    const storeState = {
      selectedFeeTypeId: "fee-1",
      selectedScheduleId: "sch-1",
      setSelectedFeeTypeId: mockSetSelectedFeeTypeId,
      setSelectedScheduleId: mockSetSelectedScheduleId,
    };

    (
      useFastPaymentStore as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((selector) => selector(storeState));

    const mockChildren = vi
      .fn()
      .mockReturnValue(<div>Payment Form Rendered</div>);

    render(
      <FeeSelection enrollmentId="enroll-1" schoolId="school-1" yearId="year-1">
        {mockChildren}
      </FeeSelection>,
    );

    expect(mockChildren).toHaveBeenCalledWith({
      totalAmount: 35000,
      amountPaid: 0,
      assignmentId: "assign-1",
    });
    expect(screen.getByText("Payment Form Rendered")).toBeDefined();
  });

  it("handles empty overview data gracefully without throwing errors (Edge Case)", () => {
    (useGetStudentPaymentOverview as any).mockReturnValue({
      data: { payments: [] },
    });

    const storeState = {
      selectedFeeTypeId: "non-existent",
      selectedScheduleId: "non-existent",
      setSelectedFeeTypeId: mockSetSelectedFeeTypeId,
      setSelectedScheduleId: mockSetSelectedScheduleId,
    };

    (
      useFastPaymentStore as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((selector) => selector(storeState));

    const { container } = render(
      <FeeSelection
        enrollmentId="enroll-1"
        schoolId="school-1"
        yearId="year-1"
      />,
    );

    expect(container).toBeDefined();
  });
});
