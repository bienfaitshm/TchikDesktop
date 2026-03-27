import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FormDialog, ImperativeFormDialogHandle, useFormDialogRef } from "./dialog-form";
import React from "react";

describe("FormDialog avec Valeurs Initiales", () => {

    interface User { name: string; age: number; }

    it("devrait passer les valeurs initiales au formulaire via le Trigger", () => {
        const initialUser: User = { name: "Bienfait", age: 25 };

        render(
            <FormDialog.Root>
                <FormDialog.Trigger initialValues={initialUser}>Ouvrir</FormDialog.Trigger>
                <FormDialog.Content>
                    <FormDialog.Form<User>>
                        {(data) => (
                            <form>
                                <input data-testid="name-input" defaultValue={data?.name} />
                            </form>
                        )}
                    </FormDialog.Form>
                </FormDialog.Content>
            </FormDialog.Root>
        );

        fireEvent.click(screen.getByText("Ouvrir"));

        const input = screen.getByTestId("name-input") as HTMLInputElement;
        expect(input.value).toBe("Bienfait");
    });

    it("devrait fonctionner de manière impérative avec des données", () => {
        const dialogRef = useFormDialogRef<User>();

        render(
            <FormDialog.Root ref={dialogRef}>
                <FormDialog.Content>
                    <FormDialog.Form<User>>
                        {(data) => <div data-testid="data-display">{data?.name}</div>}
                    </FormDialog.Form>
                </FormDialog.Content>
            </FormDialog.Root>
        );

        // Appel impératif
        React.act(() => {
            dialogRef.current?.open({ name: "Shomari", age: 30 });
        });

        expect(screen.getByTestId("data-display")).toHaveTextContent("Shomari");
    });
});