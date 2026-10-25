import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  InvoicePrintContainer,
  PrintInvoiceButton,
} from "./invoice-print-container";
import type { Invoice } from "@/renderer/libs/invoice-preview-printing";

// Mocks for external dependencies
vi.mock("@/components/invoices", () => ({
  ActionPrintContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ActionPrintHeaderStatus: ({ isPrinted }: { isPrinted: boolean }) => (
    <div data-testid="header-status">
      {isPrinted ? "Printed" : "Not Printed"}
    </div>
  ),
  PrinterConfigView: ({
    children,
  }: {
    children: (isConfig: boolean, isConnected: boolean) => React.ReactNode;
  }) => <div data-testid="printer-config">{children(true, true)}</div>,
  PrintInvoiceButton: ({ disabled, isPrinting, onClick }: any) => (
    <button data-testid="print-btn" disabled={disabled} onClick={onClick}>
      {isPrinting ? "Printing..." : "Print"}
    </button>
  ),
}));

const mockSubmit = vi.fn();
vi.mock("@renderer/libs/queries/printing", () => ({
  usePrintInvoiceForm: () => ({
    isSubmitting: false,
    onSubmit: mockSubmit,
  }),
}));

const mockMarkAsPrinted = vi.fn();
vi.mock("@renderer/libs/invoice-preview-printing", () => ({
  InvoiceHistoryDialog: () => <div data-testid="history-dialog">History</div>,
  useInvoiceStore: (selector: any) =>
    selector({ markAsPrinted: mockMarkAsPrinted }),
}));

vi.mock("@renderer/libs/queries/suspense", () => ({
  Suspense: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("InvoicePrintContainer", () => {
  const mockInvoice: Invoice = {
    id: "inv-001",
    type: "STANDARD",
    invoiceRef: "REF-123",
    isPrinted: false,
  } as Invoice;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default properties", () => {
    render(<InvoicePrintContainer invoice={mockInvoice} />);

    expect(screen.getByTestId("header-status")).toHaveTextContent(
      "Not Printed",
    );
    expect(screen.getByTestId("history-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("print-btn")).toBeInTheDocument();
  });

  it("omits the print toolbar when showPrintButton is false", () => {
    render(
      <InvoicePrintContainer invoice={mockInvoice} showPrintButton={false} />,
    );

    expect(screen.queryByTestId("print-btn")).not.toBeInTheDocument();
  });

  it("renders custom invoice content when provided", () => {
    const CustomContent = ({ invoice }: { invoice: Invoice }) => (
      <div data-testid="custom-content">Ref: {invoice.invoiceRef}</div>
    );

    render(
      <InvoicePrintContainer
        invoice={mockInvoice}
        invoiceContent={CustomContent}
      />,
    );

    expect(screen.getByTestId("custom-content")).toHaveTextContent(
      "Ref: REF-123",
    );
  });

  it("triggers print submission with correct payload on button click", () => {
    render(<PrintInvoiceButton invoice={mockInvoice} disabled={false} />);

    const button = screen.getByTestId("print-btn");
    fireEvent.click(button);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      invoiceCode: "STANDARD",
      id: "inv-001",
      invoiceRef: "REF-123",
    });
  });
});
