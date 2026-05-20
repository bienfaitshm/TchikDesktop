import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SchoolForm } from "../school-form";
import { describe, it, expect, vi } from "vitest";

describe("SchoolForm UX & A11y", () => {
    it("doit posséder des attributs autoComplete corrects pour l'aide au remplissage", () => {
        render(<SchoolForm />);

        expect(screen.getByLabelText(/Nom officiel/i)).toHaveAttribute("autoComplete", "organization");
        expect(screen.getByLabelText(/Ville/i)).toHaveAttribute("autoComplete", "address-level2");
    });

    it("doit soumettre les valeurs par défaut si aucune modification n'est faite", async () => {
        const onSubmit = vi.fn();
        render(<SchoolForm onSubmit={onSubmit} />);

        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
                town: "Lubumbashi"
            }));
        });
    });

    it("doit être accessible via les technologies d'assistance", () => {
        render(<SchoolForm />);
        const form = screen.getByRole("form", { name: /configuration de l'établissement/i });
        expect(form).toBeInTheDocument();
    });
});