import { render, screen, fireEvent } from "@testing-library/react";
import { StudentSeniorityStatusSelect } from "../fields/student-seriority-statut";
import { describe, it, expect, vi } from "vitest";

describe("StudentSeniorityStatusSelect", () => {
    it("doit appeler onChangeValue avec true quand 'Nouvel élève' est cliqué", () => {
        const onChange = vi.fn();
        render(<StudentSeniorityStatusSelect onChangeValue={onChange} value={false} />);

        const card = screen.getByText(/Nouvel élève/i);
        fireEvent.click(card);

        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("doit appliquer les styles de sélection correctement", () => {
        const { rerender } = render(<StudentSeniorityStatusSelect value={true} />);
        const activeCard = screen.getByText(/Nouvel élève/i).closest('label');

        expect(activeCard).toHaveClass('border-primary');
    });
});