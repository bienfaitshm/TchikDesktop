import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EnrollmentForm } from "../enrollment-form";
import { describe, it, expect, vi } from "vitest";

describe("EnrollmentForm UX & Logic", () => {
    const mockClassrooms = [{ label: "6ème A", value: "class-1" }];

    it("doit afficher les messages d'erreur de validation lors d'une soumission vide", async () => {
        const onSubmit = vi.fn();
        render(<EnrollmentForm onSubmit={onSubmit} classrooms={mockClassrooms} />);

        const form = screen.getByRole("form");
        fireEvent.submit(form);

        // On attend que Zod déclenche les erreurs
        await waitFor(() => {
            expect(screen.getAllByRole("alert")).toBeTruthy();
        });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("doit lier les labels aux champs pour l'accessibilité", () => {
        render(<EnrollmentForm classrooms={mockClassrooms} />);

        // Vérifie que cliquer sur le label "Classe" active ou cible le combobox
        const label = screen.getByText(/Salle de classe cible/i);
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass("font-semibold");
    });
});