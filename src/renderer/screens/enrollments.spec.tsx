import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnrollmentForm, EnrollmentPage } from "./enrollments";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useCreateQuickEnrollmentForm } from "@/renderer/libs/queries/enrollements";
import { useInvoiceStore } from "@/renderer/libs/invoice-preview-printing";

vi.mock("@/renderer/libs/stores/app-store", () => ({
  useCurrentConfig: vi.fn(),
}));

vi.mock("@/components/form/enrollments", () => ({
  QuickEnrollmentForm: ({ formId }: { formId: string }) => (
    <div data-testid="quick-enrollment-form" data-formid={formId} />
  ),
}));

vi.mock("@/renderer/libs/queries/enrollements", () => ({
  useCreateQuickEnrollmentForm: vi.fn(),
}));

vi.mock("@/renderer/libs/invoice-preview-printing", () => ({
  useInvoiceStore: vi.fn(),
  InvoicePreview: ({
    children,
  }: {
    children: (invoice: any) => React.ReactNode;
  }) => (
    <div data-testid="invoice-preview">
      {children({ id: "inv-1", invoiceRef: "REF-1" })}
    </div>
  ),
  InvoiceEmptyMessage: () => <div data-testid="invoice-empty-message" />,
}));

vi.mock(
  "@/renderer/apps/schools/components/enrollment-invoice-printable",
  () => ({
    EnrollmentInvoicePrintContainer: () => (
      <div data-testid="enrollment-invoice-print-container" />
    ),
  }),
);

vi.mock("@/renderer/containers/page-container", () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PageContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PageHeadTitle: ({ children }: { children: React.ReactNode }) => (
    <h1>{children}</h1>
  ),
  PageHeadDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => (
    <header>{children}</header>
  ),
  PageHeaderTextContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PageHeadAction: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/renderer/containers/invoice-grid-container", () => ({
  InvoiceGridContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InvoiceGridFormContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InvoiceGridPreviewContainer: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div>{children}</div>,
}));

vi.mock("@/components/buttons/button-loading", () => ({
  LoadingButton: ({
    children,
    onClick,
    loading,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    loading: boolean;
  }) => (
    <button data-testid="loading-button" onClick={onClick} disabled={loading}>
      {children}
    </button>
  ),
}));

vi.mock("@/renderer/apps/searching/components/capcity-infos", () => ({
  CapacityInfo: () => <div data-testid="capacity-info" />,
}));

describe("EnrollmentForm", () => {
  const mockAddInvoice = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useInvoiceStore).mockImplementation((selector: any) =>
      selector({ addInvoice: mockAddInvoice }),
    );
    vi.mocked(useCreateQuickEnrollmentForm).mockReturnValue({
      formId: "test-form-id",
      searchClassroom: [],
      searchUser: [],
      searchTutor: [],
      onSubmit: mockOnSubmit,
      isSubmitting: false,
    } as any);
  });

  it("renders form elements and submit button successfully", () => {
    render(<EnrollmentForm schoolId="school-1" yearId="year-1" />);

    expect(screen.getByTestId("quick-enrollment-form")).toBeDefined();
    expect(screen.getByTestId("loading-button")).toBeDefined();
    expect(screen.getByText("Enregistrer")).toBeDefined();
  });

  it("triggers invoice store update on successful form submission", () => {
    let capturedOnSuccess: any;
    vi.mocked(useCreateQuickEnrollmentForm).mockImplementation(
      ({ onSuccess }: any) => {
        capturedOnSuccess = onSuccess;
        return {
          formId: "test-form-id",
          onSubmit: mockOnSubmit,
          isSubmitting: false,
        } as any;
      },
    );

    const mockSuccessCallback = vi.fn();
    render(
      <EnrollmentForm
        schoolId="school-1"
        yearId="year-1"
        onSuccess={mockSuccessCallback}
      />,
    );

    const mockEnrollment = {
      enrollmentId: "enr-999",
      studentCode: "STU-999",
      createdAt: new Date("2026-01-01"),
    };

    capturedOnSuccess(mockEnrollment);

    expect(mockAddInvoice).toHaveBeenCalledWith({
      date: mockEnrollment.createdAt,
      id: "enr-999",
      invoiceRef: "STU-999",
      isPrinted: false,
      type: "enrollment",
    });
    expect(mockSuccessCallback).toHaveBeenCalledWith(mockEnrollment);
  });
});

describe("EnrollmentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders configuration warning message when schoolId or yearId is missing", () => {
    vi.mocked(useCurrentConfig).mockReturnValue({ schoolId: "", yearId: "" });

    render(<EnrollmentPage />);

    expect(screen.getByText("Terminal d'inscription")).toBeDefined();
    expect(
      screen.getByText(
        "Veuillez sélectionner une école et une année académique valide.",
      ),
    ).toBeDefined();
    expect(screen.queryByTestId("quick-enrollment-form")).toBeNull();
  });

  it("renders enrollment form and preview components when configuration is valid", () => {
    vi.mocked(useCurrentConfig).mockReturnValue({
      schoolId: "school-1",
      yearId: "year-1",
    });
    vi.mocked(useCreateQuickEnrollmentForm).mockReturnValue({
      formId: "test-form-id",
      onSubmit: vi.fn(),
      isSubmitting: false,
    } as any);

    render(<EnrollmentPage />);

    expect(screen.getByText("Terminal d'inscription")).toBeDefined();
    expect(screen.getByTestId("quick-enrollment-form")).toBeDefined();
    expect(screen.getByTestId("invoice-preview")).toBeDefined();
    expect(
      screen.getByTestId("enrollment-invoice-print-container"),
    ).toBeDefined();
  });
});
