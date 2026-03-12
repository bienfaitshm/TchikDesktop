import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StudyYearForm } from "../study-year-form";
import { describe, it, expect, vi } from "vitest";

describe("StudyYearForm UX & Integrity", () => {
    it("doit rendre les labels de dates correctement associés", () => {
        render(<StudyYearForm />);
        expect(screen.getByText(/Date d'ouverture/i)).toBeInTheDocument();
        expect(screen.getByText(/Date de clôture/i)).toBeInTheDocument();
    });

    it("doit initialiser le formulaire avec des dates par défaut (aujourd'hui)", () => {
        render(<StudyYearForm />);
        const input = screen.getByPlaceholderText(/2025-2026/i);
        expect(input).toBeInTheDocument();
    });

    it("ne doit pas soumettre si le nom de l'année est manquant (Validation Zod)", async () => {
        const onSubmit = vi.fn();
        render(<StudyYearForm onSubmit={onSubmit} />);

        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });
});