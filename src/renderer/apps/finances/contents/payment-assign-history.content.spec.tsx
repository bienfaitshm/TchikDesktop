import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentAssignHistory } from "./payment-assign-history.content";

const mockUseGetStudentPayments = vi.fn();

vi.mock("@/renderer/libs/queries/finances", () => ({
  useGetStudentPayments: (params: any) => mockUseGetStudentPayments(params),
}));

vi.mock("../components/payment-invoice-content", () => ({
  PaymentInvoiceContent: ({ payment }: any) => (
    <div data-testid="payment-invoice-content">
      Invoice for {payment.paymentId}
    </div>
  ),
}));

vi.mock("@/packages/times", () => ({
  formatDate: (date: string) => `Formatted: ${date}`,
}));

vi.mock("@/packages/currency", () => ({
  formatCurrency: (amount: number) => `$${amount}`,
}));

vi.mock("@/packages/@core/data-access/db/options", () => ({
  PAYMENT_METHOD_ENUM: {
    CASH: "CASH",
    BANK: "BANK",
    MOBILE_MONEY: "MOBILE_MONEY",
  },
  getPaymentStatusLabel: (status: string) => `Status: ${status}`,
}));

describe("PaymentAssignHistory", () => {
  const mockPayments = [
    {
      paymentId: 1,
      amountReceived: 100,
      amountConverted: 100,
      paymentMethod: "CASH",
      status: "COMPLETED",
      transactionReference: "TRX-001",
      createdAt: "2026-01-01",
    },
    {
      paymentId: 2,
      amountReceived: 200,
      amountConverted: 180,
      paymentMethod: "BANK",
      status: "PENDING",
      transactionReference: "TRX-002",
      createdAt: "2026-01-02",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockUseGetStudentPayments.mockReturnValue({
      data: [],
      isLoading: true,
    });

    const { container } = render(<PaymentAssignHistory assignmentId="asg-1" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders empty state when payments list is empty", () => {
    mockUseGetStudentPayments.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<PaymentAssignHistory assignmentId="asg-1" />);
    expect(screen.getByText("Aucun versement")).toBeInTheDocument();
  });

  it("renders payment items and initial selected invoice when payments are loaded", () => {
    mockUseGetStudentPayments.mockReturnValue({
      data: mockPayments,
      isLoading: false,
    });

    render(<PaymentAssignHistory assignmentId="asg-1" />);

    expect(screen.getByText("TRX-001")).toBeInTheDocument();
    expect(screen.getByText("TRX-002")).toBeInTheDocument();
    expect(screen.getByTestId("payment-invoice-content")).toHaveTextContent(
      "Invoice for 1",
    );
  });

  it("changes selected invoice when a payment item is clicked", () => {
    mockUseGetStudentPayments.mockReturnValue({
      data: mockPayments,
      isLoading: false,
    });

    render(<PaymentAssignHistory assignmentId="asg-1" />);

    const secondPaymentItem = screen.getByText("TRX-002").closest("div");
    if (secondPaymentItem) {
      fireEvent.click(secondPaymentItem);
    }

    expect(screen.getByTestId("payment-invoice-content")).toHaveTextContent(
      "Invoice for 2",
    );
  });

  it("navigates payments using keyboard arrow keys (ArrowDown and ArrowUp)", () => {
    mockUseGetStudentPayments.mockReturnValue({
      data: mockPayments,
      isLoading: false,
    });

    render(<PaymentAssignHistory assignmentId="asg-1" />);

    expect(screen.getByTestId("payment-invoice-content")).toHaveTextContent(
      "Invoice for 1",
    );

    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByTestId("payment-invoice-content")).toHaveTextContent(
      "Invoice for 2",
    );

    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByTestId("payment-invoice-content")).toHaveTextContent(
      "Invoice for 1",
    );

    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(screen.getByTestId("payment-invoice-content")).toHaveTextContent(
      "Invoice for 2",
    );
  });
});
