import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useCreateClassroomForm } from "./classroom-form.actions";
import { useCreateClassroom } from "@/renderer/libs/queries/classroom";

// Mock des hooks et utilitaires
vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/renderer/libs/queries/classroom", () => ({
    useCreateClassroom: vi.fn(),
    useUpdateClassroom: vi.fn(),
}));

vi.mock("@/renderer/hooks/data-as-options", () => ({
    useGetOptionAsOptions: () => ({ options: [], data: [] }),
}));

describe("useCreateClassroomForm", () => {
    const mockMutate = vi.fn();
    const schoolId = "school-123";

    beforeEach(() => {
        vi.clearAllMocks();
        (useCreateClassroom as Mock).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        });
    });

    it("doit appeler la mutation avec les données correctes lors du onSubmit", async () => {
        const { result } = renderHook(() => useCreateClassroomForm(schoolId));

        const formData = { identifier: "Classe A", optionId: "opt-1" };

        result.current.onSubmit(formData as any);

        expect(mockMutate).toHaveBeenCalledWith(
            formData,
            expect.objectContaining({
                successMessageTitle: expect.any(String),
            })
        );
    });

    it("génère un formId unique", () => {
        const { result } = renderHook(() => useCreateClassroomForm(schoolId));
        expect(result.current.formId).toBeDefined();
        expect(typeof result.current.formId).toBe("string");
    });
});