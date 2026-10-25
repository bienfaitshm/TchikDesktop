import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_INVOICES = 30;

/**
 * Represents the state and metadata of an invoice preview.
 */
export interface Invoice {
  id: string;
  invoiceRef: string;
  type: string;
  isPrinted: boolean;
  date: Date;
}

/**
 * Defines the state structure and actions for the invoice store.
 */
export interface InvoiceStoreState {
  invoices: Invoice[];
  getLatestInvoice: (type?: string) => Invoice | undefined;
  markAsPrinted: (id: string) => boolean;
  addInvoice: (invoice: Invoice) => void;
  removeInvoice: (id: string) => boolean;
}

/**
 * Zustand store for managing preview invoices with localStorage persistence and capacity limits.
 */
export const useInvoiceStore = create<InvoiceStoreState>()(
  persist(
    (set, get) => ({
      invoices: [],

      /**
       * Retrieves the latest invoice, optionally filtered by type.
       * @param type - Optional invoice type filter.
       * @returns The latest Invoice object or undefined if none found.
       */
      getLatestInvoice: (type?: string) => {
        const _invoices = get().invoices;
        const invoices = type
          ? _invoices.filter((invoice) => invoice.type === type)
          : _invoices;
        return invoices.length > 0 ? invoices[invoices.length - 1] : undefined;
      },

      /**
       * Marks a specific invoice as printed by its identifier.
       * @param id - Unique identifier of the invoice.
       * @returns True if the invoice was found and updated, false otherwise.
       */
      markAsPrinted: (id: string) => {
        let isUpdated = false;
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id === id) {
              isUpdated = true;
              return { ...invoice, isPrinted: true };
            }
            return invoice;
          }),
        }));
        return isUpdated;
      },

      /**
       * Adds an invoice to the store, prevents duplicates, and enforces MAX_INVOICES capacity via FIFO.
       * @param invoice - The invoice object to add.
       */
      addInvoice: (invoice: Invoice) => {
        set((state) => {
          const filteredInvoices = state.invoices.filter(
            (inv) => inv.id !== invoice.id,
          );
          const updatedInvoices = [...filteredInvoices, invoice];

          if (updatedInvoices.length > MAX_INVOICES) {
            updatedInvoices.shift();
          }

          return { invoices: updatedInvoices };
        });
      },

      /**
       * Removes an invoice from the store by its identifier.
       * @param id - Unique identifier of the invoice to remove.
       * @returns True if an invoice was successfully removed, false otherwise.
       */
      removeInvoice: (id: string) => {
        const initialLength = get().invoices.length;
        set((state) => ({
          invoices: state.invoices.filter((invoice) => invoice.id !== id),
        }));
        return get().invoices.length < initialLength;
      },
    }),
    {
      name: "preview-invoice-storage",
    },
  ),
);
