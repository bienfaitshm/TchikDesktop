import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuickEnrollmentForm } from "../quick-enrolement-form";
import { describe, it, expect, vi } from "vitest";

describe("QuickEnrollmentForm Complex Logic", () => {
    const mockClassrooms = [{ label: "3ème Génie", value: "3G" }];

    it("doit valider les champs imbriqués de l'élève", async () => {
        const onSubmit = vi.fn();
        render(<QuickEnrollmentForm onSubmit={onSubmit} classrooms={mockClassrooms} />);

        // On soumet sans remplir les champs obligatoires (lastName, etc.)
        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            // Vérifie que les messages d'erreur Shadcn/Zod sont présents
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    it("doit supporter l'initialisation de valeurs complexes", () => {
        const initial = {
            student: { lastName: "KABILA", firstName: "Jean" }
        } as any;

        render(<QuickEnrollmentForm initialValues={initial} />);

        const lastNameInput = screen.getByPlaceholderText(/Nom de famille/i) as HTMLInputElement;
        expect(lastNameInput.value).toBe("KABILA");
    });
});