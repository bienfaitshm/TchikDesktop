import { describe, it, expect, vi, beforeEach } from "vitest";
import { createContextMenuTemplate } from "@/main/context-menus";

describe("createContextMenuTemplate", () => {
  let mockWebContents: any;

  beforeEach(() => {
    mockWebContents = {
      replaceMisspelling: vi.fn(),
    };
  });

  it("doit inclure des suggestions si des fautes sont détectées", () => {
    const params = {
      dictionarySuggestions: ["Correction1", "Correction2"],
      isEditable: false,
    } as any;

    const template = createContextMenuTemplate(mockWebContents, params);

    expect(template).toContainEqual(
      expect.objectContaining({ label: "Correction1" }),
    );
    expect(template).toContainEqual(
      expect.objectContaining({ label: "Correction2" }),
    );
    expect(template).toContainEqual({ type: "separator" });
  });

  it("doit inclure les options Couper/Copier/Coller si le champ est éditable", () => {
    const params = {
      dictionarySuggestions: [],
      isEditable: true,
    } as any;

    const template = createContextMenuTemplate(mockWebContents, params);

    expect(template).toContainEqual(expect.objectContaining({ role: "cut" }));
    expect(template).toContainEqual(expect.objectContaining({ role: "copy" }));
    expect(template).toContainEqual(expect.objectContaining({ role: "paste" }));
  });

  it("doit appeler replaceMisspelling lors du clic sur une suggestion", () => {
    const params = {
      dictionarySuggestions: ["Test"],
      isEditable: false,
    } as any;

    const template = createContextMenuTemplate(mockWebContents, params);

    // Simuler le clic
    if (template.click) {
      template.click({} as any, {} as any, {} as any);
    }

    expect(mockWebContents.replaceMisspelling).toHaveBeenCalledWith("Test");
  });

  it("doit retourner un template vide si rien n’est suggéré ou éditable", () => {
    const params = {
      dictionarySuggestions: [],
      isEditable: false,
    } as any;

    const template = createContextMenuTemplate(mockWebContents, params);
    expect(template.length).toBe(0);
  });
});
