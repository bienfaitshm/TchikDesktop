import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnrollmentInvoiceContent } from "./enrollment-invoice-printable";
import { useGetEnrollmentById } from "@/renderer/libs/queries/enrollements";

vi.mock("@/renderer/libs/queries/enrollements", () => ({
  useGetEnrollmentById: vi.fn(),
}));

vi.mock("@/components/invoices/enrollment-invoice", () => ({
  EnrollmentInvoice: (props: any) => (
    <div
      data-testid="mock-enrollment-invoice"
      data-props={JSON.stringify(props)}
    />
  ),
}));

describe("EnrollmentInvoiceContent", () => {
  const mockInvoice = {
    id: "inv-001",
    invoiceRef: "REF-001",
    isPrinted: false,
    type: "enrollment",
    date: "2026-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with complete enrollment and guardian data", () => {
    vi.mocked(useGetEnrollmentById).mockReturnValue({
      data: {
        studentCode: "STU-001",
        student: { fullName: "John Doe" },
        classroom: { shortIdentifier: "5A" },
        tutor: {
          fullName: "Jane Doe",
          phoneNumber: "123456789",
          address: "123 Main St",
        },
      },
    } as any);

    render(<EnrollmentInvoiceContent invoice={mockInvoice} />);

    const component = screen.getByTestId("mock-enrollment-invoice");
    expect(component).toBeDefined();

    const passedProps = JSON.parse(
      component.getAttribute("data-props") || "{}",
    );
    expect(passedProps.student).toEqual({
      code: "STU-001",
      name: "John Doe",
      classroom: "5A",
    });
    expect(passedProps.guardian).toEqual({
      name: "Jane Doe",
      phone: "123456789",
      address: "123 Main St",
    });
    expect(passedProps.invoiceRef).toBe("REF-001");
  });

  it("handles missing enrollment data gracefully (edge case)", () => {
    vi.mocked(useGetEnrollmentById).mockReturnValue({
      data: undefined,
    } as any);

    render(<EnrollmentInvoiceContent invoice={mockInvoice} />);

    const component = screen.getByTestId("mock-enrollment-invoice");
    expect(component).toBeDefined();

    const passedProps = JSON.parse(
      component.getAttribute("data-props") || "{}",
    );
    expect(passedProps.student).toEqual({
      code: "REF-001",
      name: "",
      classroom: "",
    });
    expect(passedProps.guardian).toBeUndefined();
    expect(passedProps.invoiceRef).toBe("REF-001");
  });

  it("handles missing tutor and incomplete student data gracefully", () => {
    vi.mocked(useGetEnrollmentById).mockReturnValue({
      data: {
        studentCode: "STU-002",
        student: null,
        classroom: null,
        tutor: null,
      },
    } as any);

    render(<EnrollmentInvoiceContent invoice={mockInvoice} />);

    const component = screen.getByTestId("mock-enrollment-invoice");
    expect(component).toBeDefined();

    const passedProps = JSON.parse(
      component.getAttribute("data-props") || "{}",
    );
    expect(passedProps.student).toEqual({
      code: "STU-002",
      name: "",
      classroom: "",
    });
    expect(passedProps.guardian).toBeUndefined();
  });
});
