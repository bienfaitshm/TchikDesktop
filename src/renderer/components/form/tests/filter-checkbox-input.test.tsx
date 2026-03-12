import { render, screen, fireEvent } from "@testing-library/react";
import { FilterCheckboxInput } from "../fields/filter-checkbox-input";
import { describe, it, expect, vi } from "vitest";

describe("FilterCheckboxInput Logic", () => {
    const options = [
        { label: "Option A", value: "a" },
        { label: "Option B", value: "b" },
    ];

    it("doit filtrer les options selon la saisie", async () => {
        render(<FilterCheckboxInput name="test" options={options} />);

        // Ouvrir le popover
        fireEvent.click(screen.getByRole("combobox"));

        const searchInput = screen.getByPlaceholderText(/filtrer par/i);
        fireEvent.change(searchInput, { target: { value: "Option A" } });

        expect(screen.getByText("Option A")).toBeInTheDocument();
        expect(screen.queryByText("Option B")).not.toBeInTheDocument();
    });

    it("doit appeler onChangeValue avec une nouvelle liste lors du clic", () => {
        const onChange = vi.fn();
        render(<FilterCheckboxInput name="test" options={options} value={["a"]} onChangeValue={onChange} />);

        fireEvent.click(screen.getByRole("combobox"));

        // Cocher Option B
        const labelB = screen.getByText("Option B");
        fireEvent.click(labelB);

        expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    });

    it("doit vider la sélection lors du clic sur Effacer", () => {
        const onChange = vi.fn();
        render(<FilterCheckboxInput name="test" options={options} value={["a", "b"]} onChangeValue={onChange} />);

        fireEvent.click(screen.getByRole("combobox"));
        const clearBtn = screen.getByText(/Effacer/i);
        fireEvent.click(clearBtn);

        expect(onChange).toHaveBeenCalledWith([]);
    });
});