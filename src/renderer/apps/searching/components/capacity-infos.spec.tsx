import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CapacityInfo } from "./capcity-infos";
import { useGetStatsByClass } from "@/renderer/libs/queries/dashboard";

vi.mock("@/renderer/libs/queries/dashboard", () => ({
  useGetStatsByClass: vi.fn(),
}));

describe("CapacityInfo", () => {
  const mockClassStats = [
    {
      classId: "cls-1",
      label: "1ère Maternelle",
      shortName: "1Mat",
      section: "KINDERGARTEN",
      value: 25,
    },
    {
      classId: "cls-2",
      label: "6ème Primaire",
      shortName: "6Pri",
      section: "PRIMARY",
      value: 30,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders total student count correctly", () => {
    vi.mocked(useGetStatsByClass).mockReturnValue({
      data: mockClassStats,
    } as any);

    render(<CapacityInfo schoolId="school-1" yearId="year-1" />);

    expect(screen.getByText("Total Élèves")).toBeDefined();
    expect(screen.getByText("55")).toBeDefined();
  });

  it("toggles details panel expansion when clicked", () => {
    vi.mocked(useGetStatsByClass).mockReturnValue({
      data: mockClassStats,
    } as any);

    render(<CapacityInfo schoolId="school-1" yearId="year-1" />);

    const button = screen.getByRole("button", { expanded: false });
    expect(screen.queryByTestId("capacity-details-panel")).toBeNull();

    fireEvent.click(button);

    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Répartition par section")).toBeDefined();
    expect(screen.getByText("Maternelle")).toBeDefined();
    expect(screen.getByText("Primaire")).toBeDefined();
    expect(screen.getByText("1Mat")).toBeDefined();
    expect(screen.getByText("6Pri")).toBeDefined();
  });

  it("handles empty class statistics gracefully (edge case)", () => {
    vi.mocked(useGetStatsByClass).mockReturnValue({
      data: [],
    } as any);

    render(<CapacityInfo schoolId="school-1" yearId="year-1" />);

    expect(screen.getByText("0")).toBeDefined();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Aucune donnée disponible")).toBeDefined();
  });
});
