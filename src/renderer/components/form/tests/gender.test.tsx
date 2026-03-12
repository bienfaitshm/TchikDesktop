import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GenderInput } from "../fields/gender";
import { USER_GENDER } from "@/packages/@core/data-access/db";
import { describe, it, expect, vi } from "vitest";

describe("GenderInput Component", () => {
    it("doit afficher la valeur par défaut ou la valeur fournie", () => {
        render(<GenderInput value={USER_GENDER.FEMALE} />);
        // Radix Select affiche le label correspondant à la valeur
        expect(screen.getByText(/Féminin/i || /Femme/i)).toBeInTheDocument();
    });

    it("doit appeler onChange lors de la sélection d'une option", async () => {
        const onChange = vi.fn();
        render(<GenderInput onChange={onChange} value={USER_GENDER.MALE} />);

        // Ouvrir le select
        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);

        // Sélectionner l'option Féminin
        const option = await screen.findByText(/Féminin/i || /Femme/i);
        fireEvent.click(option);

        expect(onChange).toHaveBeenCalledWith(USER_GENDER.FEMALE);
    });

    it("doit être accessible via le clavier", async () => {
        render(<GenderInput />);
        const trigger = screen.getByRole("combobox");

        trigger.focus();
        expect(document.activeElement).toBe(trigger);
    });
});