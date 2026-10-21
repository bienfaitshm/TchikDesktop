import { describe, it, expect, beforeEach } from "vitest";
import { useInvoiceStore, Invoice } from "./hooks";

describe("InvoiceStore", () => {
  beforeEach(() => {
    useInvoiceStore.setState({ invoices: [] });
    localStorage.clear();
  });

  it("should initialize with an empty invoice list", () => {
    const state = useInvoiceStore.getState();
    expect(state.invoices).toEqual([]);
    expect(state.getLatestInvoice()).toBeUndefined();
  });

  it("should add an invoice successfully", () => {
    const newInvoice: Invoice = {
      id: "1",
      invoiceRef: "INV-001",
      type: "standard",
      isPrinted: false,
    };

    useInvoiceStore.getState().addInvoice(newInvoice);
    const state = useInvoiceStore.getState();

    expect(state.invoices).toHaveLength(1);
    expect(state.getLatestInvoice()).toEqual(newInvoice);
  });

  it("should filter latest invoice by type correctly", () => {
    const store = useInvoiceStore.getState();
    store.addInvoice({
      id: "1",
      invoiceRef: "INV-001",
      type: "standard",
      isPrinted: false,
    });
    store.addInvoice({
      id: "2",
      invoiceRef: "INV-002",
      type: "proforma",
      isPrinted: false,
    });

    expect(store.getLatestInvoice("standard")?.id).toBe("1");
    expect(store.getLatestInvoice("proforma")?.id).toBe("2");
    expect(store.getLatestInvoice("unknown")).toBeUndefined();
  });

  it("should enforce MAX_INVOICES limit using FIFO eviction", () => {
    const store = useInvoiceStore.getState();

    for (let i = 1; i <= 31; i++) {
      store.addInvoice({
        id: `${i}`,
        invoiceRef: `INV-0${i}`,
        type: "standard",
        isPrinted: false,
      });
    }

    const state = useInvoiceStore.getState();
    expect(state.invoices).toHaveLength(30);
    expect(state.invoices[0].id).toBe("2");
    expect(state.getLatestInvoice()?.id).toBe("31");
  });

  it("should prevent duplicate invoices by replacing existing ones", () => {
    const store = useInvoiceStore.getState();
    const invoice: Invoice = {
      id: "1",
      invoiceRef: "INV-001",
      type: "standard",
      isPrinted: false,
    };

    store.addInvoice(invoice);
    store.addInvoice({ ...invoice, invoiceRef: "INV-001-UPDATED" });

    const state = useInvoiceStore.getState();
    expect(state.invoices).toHaveLength(1);
    expect(state.invoices[0].invoiceRef).toBe("INV-001-UPDATED");
  });

  it("should mark an invoice as printed successfully", () => {
    const store = useInvoiceStore.getState();
    store.addInvoice({
      id: "1",
      invoiceRef: "INV-001",
      type: "standard",
      isPrinted: false,
    });

    const success = store.markAsPrinted("1");
    expect(success).toBe(true);
    expect(store.getLatestInvoice()?.isPrinted).toBe(true);
  });

  it("should return false when marking a non-existent invoice as printed", () => {
    const store = useInvoiceStore.getState();
    const success = store.markAsPrinted("non-existent");
    expect(success).toBe(false);
  });

  it("should remove an invoice successfully", () => {
    const store = useInvoiceStore.getState();
    store.addInvoice({
      id: "1",
      invoiceRef: "INV-001",
      type: "standard",
      isPrinted: false,
    });

    const removed = store.removeInvoice("1");
    expect(removed).toBe(true);
    expect(store.invoices).toHaveLength(0);
  });

  it("should return false when removing a non-existent invoice", () => {
    const store = useInvoiceStore.getState();
    const removed = store.removeInvoice("non-existent");
    expect(removed).toBe(false);
  });
});
