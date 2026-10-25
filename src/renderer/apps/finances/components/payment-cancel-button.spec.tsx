import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CancelPaymentButton } from "./payment-cancel-button";

const mockOnSubmit = vi.fn();
const mockUseCancelStudentPaymentForm = vi.fn();

vi.mock("@/renderer/libs/queries/finances", () => ({
  useCancelStudentPaymentForm: () => mockUseCancelStudentPaymentForm(),
}));

vi.mock("@/renderer/components/buttons/button-loading", () => ({
  LoadingButton: ({ children, loading, disabled, ...props }: any) => (
    <button
      data-testid="loading-button"
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Chargement..." : children}
    </button>
  ),
}));

describe("CancelPaymentButton", () => {
  const mockInvoice = { id: 1042 } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCancelStudentPaymentForm.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSubmitting: false,
    });
  });

  it("affiche le badge 'Paiement annulé' lorsque isCanceled est vrai", () => {
    render(<CancelPaymentButton invoice={mockInvoice} isCanceled={true} />);

    expect(screen.getByText("Paiement annulé")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /annuler le paiement/i }),
    ).not.toBeInTheDocument();
  });

  it("affiche le bouton d'annulation lorsque isCanceled est faux", () => {
    render(<CancelPaymentButton invoice={mockInvoice} isCanceled={false} />);

    const button = screen.getByRole("button", { name: /annuler le paiement/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("ouvre la boîte de dialogue avec le numéro de facture au clic", () => {
    render(<CancelPaymentButton invoice={mockInvoice} />);

    const triggerButton = screen.getByRole("button", {
      name: /annuler le paiement/i,
    });
    fireEvent.click(triggerButton);

    expect(screen.getByText("Annuler ce paiement ?")).toBeInTheDocument();
    expect(screen.getByText(/n°1042/i)).toBeInTheDocument();
  });

  it("appelle onSubmit avec l'ID du paiement lors de la confirmation", () => {
    render(<CancelPaymentButton invoice={mockInvoice} />);

    fireEvent.click(
      screen.getByRole("button", { name: /annuler le paiement/i }),
    );

    const confirmButton = screen.getByRole("button", {
      name: /confirmer l'annulation/i,
    });
    fireEvent.click(confirmButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({ paymentId: 1042 });
  });

  it("désactive le bouton lorsque la mutation est en cours de soumission", () => {
    mockUseCancelStudentPaymentForm.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSubmitting: true,
    });

    render(<CancelPaymentButton invoice={mockInvoice} />);

    const button = screen.getByTestId("loading-button");
    expect(button).toBeDisabled();
  });
});
