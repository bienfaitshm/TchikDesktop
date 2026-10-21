import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoicePreview, InvoiceEmptyMessage } from "./preview-invoice";
import { useInvoiceStore } from "./hooks";

vi.mock("./hooks", () => ({
  useInvoiceStore: vi.fn(),
}));

describe("InvoicePreview & InvoiceEmptyMessage Components", () => {
  const mockMarkAsPrinted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty message when no invoice exists", () => {
    (useInvoiceStore as any).mockImplementation((selector: any) => {
      const state = {
        invoices: [],
        getLatestInvoice: () => undefined,
        markAsPrinted: mockMarkAsPrinted,
      };
      return selector(state);
    });

    render(
      <InvoicePreview messageInfo={<InvoiceEmptyMessage />}>
        {(invoice) => <div>{invoice.invoiceRef}</div>}
      </InvoicePreview>,
    );

    expect(screen.getByText("Aperçu du reçu d'inscription")).toBeDefined();
    expect(
      screen.getByText(
        "Le détail du reçu s'affichera ici une fois l'inscription de l'élève enregistrée.",
      ),
    ).toBeDefined();
  });

  it("should render latest invoice children when invoice exists", () => {
    const sampleInvoice = {
      id: "1",
      invoiceRef: "INV-2026-001",
      type: "registration",
      isPrinted: false,
      date: "2026-10-21",
    };

    (useInvoiceStore as any).mockImplementation((selector: any) => {
      const state = {
        invoices: [sampleInvoice],
        getLatestInvoice: () => sampleInvoice,
        markAsPrinted: mockMarkAsPrinted,
      };
      return selector(state);
    });

    render(
      <InvoicePreview messageInfo={<InvoiceEmptyMessage />}>
        {(invoice) => (
          <div data-testid="invoice-content">{invoice.invoiceRef}</div>
        )}
      </InvoicePreview>,
    );

    expect(screen.getByTestId("invoice-content").textContent).toBe(
      "INV-2026-001",
    );
  });

  it("should open history dialog and list invoices", async () => {
    const sampleInvoices = [
      {
        id: "1",
        invoiceRef: "INV-2026-001",
        type: "registration",
        isPrinted: false,
        date: "2026-10-21",
      },
    ];

    (useInvoiceStore as any).mockImplementation((selector: any) => {
      const state = {
        invoices: sampleInvoices,
        getLatestInvoice: () => sampleInvoices[0],
        markAsPrinted: mockMarkAsPrinted,
      };
      return selector(state);
    });

    render(
      <InvoicePreview messageInfo={<InvoiceEmptyMessage />}>
        {(invoice) => <div>{invoice.invoiceRef}</div>}
      </InvoicePreview>,
    );

    const historyButton = screen.getByRole("button", {
      name: /historique des reçus/i,
    });
    fireEvent.click(historyButton);

    expect(
      await screen.findByText("Liste des reçus enregistrés"),
    ).toBeDefined();
    expect(screen.getByText("INV-2026-001")).toBeDefined();
  });
});
