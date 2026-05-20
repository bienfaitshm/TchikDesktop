import { render, screen, fireEvent } from "@testing-library/react";
import { StudentStatus } from "../fields/student-status";
import { STUDENT_STATUS } from "@/packages/@core/data-access/db";
import { describe, it, expect, vi } from "vitest";

describe("StudentStatus Component", () => {
    it("doit afficher le statut sélectionné avec son indicateur", () => {
        render(<StudentStatus value={STUDENT_STATUS.EN_COURS} />);
        // Le Select de Shadcn affiche le texte à l'intérieur du déclencheur
        expect(screen.getByText(/En cours/i)).toBeInTheDocument();
    });

    it("doit appeler onChange avec la nouvelle valeur lors de la sélection", async () => {
        const onChange = vi.fn();
        render(<StudentStatus onChange={onChange} />);

        // Ouvrir le menu
        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);

        // Cliquer sur un élément (ex: Abandon)
        const item = await screen.findByText(/Abandon/i);
        fireEvent.click(item);

        expect(onChange).toHaveBeenCalledWith(STUDENT_STATUS.ABANDON);
    });
});