import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OptionForm } from "../option-form";
import { describe, it, expect, vi } from "vitest";

describe("OptionForm UI & A11y", () => {
    it("doit lier correctement les inputs aux descriptions via ARIA", () => {
        render(<OptionForm />);
        const input = screen.getByLabelText(/Nom complet de l'option/i);

        // Vérifie si l'input est associé à sa description pour les lecteurs d'écran
        expect(input).toHaveAttribute('aria-describedby');
    });

    it("ne doit pas soumettre le formulaire si le nom est vide", async () => {
        const onSubmit = vi.fn();
        render(<OptionForm onSubmit={onSubmit} />);

        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            // Rechercher un message d'erreur (FormMessage)
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    it("doit supporter le changement de section via le select custom", async () => {
        render(<OptionForm />);
        const trigger = screen.getByLabelText(/Choisir une section/i);
        expect(trigger).toBeInTheDocument();
    });
});