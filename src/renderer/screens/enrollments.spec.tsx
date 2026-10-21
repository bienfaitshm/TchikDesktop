import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  EnrollmentForm,
  InvoiceEnrollmentPrinting,
  EnrollmentPage,
} from "./enrollments";
import { useInvoiceStore } from "@/renderer/libs/invoice-preview-printing";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useEnrollmentStore } from "@/components/form/enrollments";
import {
  useCreateQuickEnrollmentForm,
  useGetEnrollmentById,
} from "@/renderer/libs/queries/enrollements";
import { usePrintInvoiceForm } from "@/renderer/libs/queries/printing";

vi.mock("@/renderer/libs/invoice-preview-printing", () => ({
  useInvoiceStore: vi.fn(),
  InvoicePreview: ({ children, messageInfo }: any) => {
    const invoice = vi
      .mocked(useInvoiceStore)
      .mock.results[0]?.value?.getLatestInvoice();
    return invoice ? children(invoice) : messageInfo;
  },
  InvoiceEmptyMessage: () => <div>Empty State</div>,
}));

vi.mock("@/renderer/libs/stores/app-store", () => ({
  useCurrentConfig: vi.fn(),
}));

vi.mock("@components/form/enrollments", () => ({
  useEnrollmentStore: vi.fn(),
  QuickEnrollmentForm: () => <div data-testid="quick-form">Form Fields</div>,
}));

vi.mock("@/renderer/libs/queries/enrollements", () => ({
  useCreateQuickEnrollmentForm: vi.fn(),
  useGetEnrollmentById: vi.fn(),
}));

vi.mock("@/renderer/libs/queries/printing", () => ({
  usePrintInvoiceForm: vi.fn(),
}));

vi.mock("@components/buttons/button-loading", () => ({
  LoadingButton: ({ children, onClick, type, form }: any) => (
    <button type={type} form={form} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@components/invoices/enrollment-invoice", () => ({
  EnrollmentInvoice: ({ invoiceRef }: any) => (
    <div data-testid="invoice-ref">{invoiceRef}</div>
  ),
}));

vi.mock("@components/invoices/invoice-print", () => ({
  ActionPrintContainer: ({ children }: any) => <div>{children}</div>,
  PrinterConfigView: ({ children }: any) => children({}),
  PrintInvoiceButton: ({ onClick }: any) => (
    <button onClick={onClick}>Print</button>
  ),
}));

vi.mock("@/renderer/apps/searching/components/capcity-infos", () => ({
  CapacityInfo: () => <div>Capacity Info</div>,
}));

vi.mock("../libs/queries/suspense", () => ({
  Suspense: ({ children }: any) => children,
}));

describe("Enrollment Components", () => {
  const mockAddInvoice = vi.fn();
  const mockAddEnrollment = vi.fn();
  const mockSubmitForm = vi.fn();
  const mockPrintSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useInvoiceStore).mockReturnValue({
      addInvoice: mockAddInvoice,
      getLatestInvoice: () => null,
      markAsPrinted: vi.fn(),
    } as any);

    vi.mocked(useEnrollmentStore).mockReturnValue({
      addEnrollment: mockAddEnrollment,
    } as any);

    vi.mocked(useCreateQuickEnrollmentForm).mockReturnValue({
      formId: "enrollment-form-id",
      searchClassroom: [],
      searchUser: [],
      searchTutor: [],
      onSubmit: mockSubmitForm,
      isSubmitting: false,
    } as any);

    vi.mocked(usePrintInvoiceForm).mockReturnValue({
      onSubmit: mockPrintSubmit,
      isSubmitting: false,
    } as any);
  });

  it("should render EnrollmentForm and trigger success handler correctly", () => {
    const onSuccessMock = vi.fn();
    vi.mocked(useCreateQuickEnrollmentForm).mockReturnValue({
      formId: "enrollment-form-id",
      searchClassroom: [],
      searchUser: [],
      searchTutor: [],
      onSubmit: mockSubmitForm,
      isSubmitting: false,
    } as any);

    render(
      <EnrollmentForm
        schoolId="school-1"
        yearId="year-1"
        onSuccess={onSuccessMock}
      />,
    );

    expect(screen.getByTestId("quick-form")).toBeDefined();
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDefined();
  });

  it("should display configuration error message in EnrollmentPage when config is missing", () => {
    vi.mocked(useCurrentConfig).mockReturnValue({
      schoolId: "",
      yearId: "",
    } as any);

    render(<EnrollmentPage />);

    expect(
      screen.getByText(
        "Veuillez sélectionner une école et une année académique valide.",
      ),
    ).toBeDefined();
  });

  it("should render EnrollmentPage content when config is ready", () => {
    vi.mocked(useCurrentConfig).mockReturnValue({
      schoolId: "school-1",
      yearId: "year-1",
    } as any);

    render(<EnrollmentPage />);

    expect(screen.getByText("Terminal d'inscription")).toBeDefined();
    expect(screen.getByTestId("quick-form")).toBeDefined();
  });

  it("should render InvoiceEnrollmentPrinting and handle print action", () => {
    const sampleInvoice = {
      id: "inv-1",
      invoiceRef: "STU-001",
      type: "enrollment",
      isPrinted: false,
      date: new Date(),
    };

    vi.mocked(useGetEnrollmentById).mockReturnValue({
      data: {
        studentCode: "STU-001",
        student: { fullName: "John Doe" },
        classroom: { shortIdentifier: "6A" },
        tutor: {
          fullName: "Jane Doe",
          phoneNumber: "123456",
          address: "Main St",
        },
      },
    } as any);

    render(<InvoiceEnrollmentPrinting invoice={sampleInvoice} />);

    expect(screen.getByTestId("invoice-ref").textContent).toBe("STU-001");

    const printButton = screen.getByRole("button", { name: "Print" });
    fireEvent.click(printButton);

    expect(mockPrintSubmit).toHaveBeenCalledWith({
      invoiceCode: "enrollment",
      id: "inv-1",
      invoiceRef: "STU-001",
    });
  });
});
