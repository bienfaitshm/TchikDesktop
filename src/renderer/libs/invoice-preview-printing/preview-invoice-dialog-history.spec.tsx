import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InvoiceHistoryDialog } from "./preview-invoice-dialog-history";
import { useInvoiceStore } from "./hooks";

vi.mock("./hooks", () => ({
  useInvoiceStore: vi.fn(),
}));

vi.mock("@/packages/times", () => ({
  formatDate: (date: string) => `formatted-${date}`,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("InvoiceHistoryDialog", () => {
  const mockMarkAsPrinted = vi.fn();
  const originalPrint = window.print;

  beforeEach(() => {
    vi.clearAllMocks();
    window.print = vi.fn();
  });

  afterEach(() => {
    window.print = originalPrint;
  });

  it("renders empty state message when invoice list is empty", () => {
    vi.mocked(useInvoiceStore).mockImplementation((selector: any) =>
      selector({
        invoices: [],
        markAsPrinted: mockMarkAsPrinted,
      }),
    );

    render(<InvoiceHistoryDialog />);

    expect(screen.getByText("Historique des reçus")).toBeDefined();
    expect(
      screen.getByText("Aucun reçu disponible dans l'historique."),
    ).toBeDefined();
  });

  it("renders invoice list items correctly when invoices are present", () => {
    const mockInvoices = [
      {
        id: "1",
        invoiceRef: "REF-001",
        type: "Standard",
        date: "2026-01-01",
        isPrinted: false,
      },
      {
        id: "2",
        invoiceRef: "REF-002",
        type: "Express",
        date: "2026-01-02",
        isPrinted: true,
      },
    ];

    vi.mocked(useInvoiceStore).mockImplementation((selector: any) =>
      selector({
        invoices: mockInvoices,
        markAsPrinted: mockMarkAsPrinted,
      }),
    );

    render(<InvoiceHistoryDialog />);

    expect(screen.getByText("REF-001")).toBeDefined();
    expect(screen.getByText("Standard")).toBeDefined();
    expect(screen.getByText("formatted-2026-01-01")).toBeDefined();
    expect(screen.getByText("Imprimer")).toBeDefined();

    expect(screen.getByText("REF-002")).toBeDefined();
    expect(screen.getByText("Express")).toBeDefined();
    expect(screen.getByText("Ré-imprimer")).toBeDefined();
  });

  it("triggers markAsPrinted and window.print on print action click", () => {
    const mockInvoices = [
      {
        id: "1",
        invoiceRef: "REF-001",
        type: "Standard",
        date: "2026-01-01",
        isPrinted: false,
      },
    ];

    vi.mocked(useInvoiceStore).mockImplementation((selector: any) =>
      selector({
        invoices: mockInvoices,
        markAsPrinted: mockMarkAsPrinted,
      }),
    );

    render(<InvoiceHistoryDialog />);

    const printButton = screen.getByText("Imprimer");
    fireEvent.click(printButton);

    expect(mockMarkAsPrinted).toHaveBeenCalledWith("1");
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
