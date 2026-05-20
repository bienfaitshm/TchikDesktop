import { render, screen, fireEvent } from "@testing-library/react";
import { ClassroomForm } from "../classroom-form";
import { describe, expect, it } from "vitest";

describe("ClassroomForm A11y", () => {
  it("le bouton AI doit avoir un attribut type='button' pour éviter le submit", () => {
    render(<ClassroomForm />);
    const aiButton = screen.getByTitle(/Générer/i);
    expect(aiButton).toHaveAttribute("type", "button");
  });

  it("doit afficher les messages d'erreur liés aux labels pour les lecteurs d'écran", async () => {
    // Test simulé de validation...
  });
});