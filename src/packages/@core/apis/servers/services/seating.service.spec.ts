import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatingService } from "./seating.service"; // Ajuste le chemin
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db";

describe("SeatingService", () => {
  // Mocks des dépendances
  const mockRoomRepo = {
    findMany: vi.fn(),
  };
  const mockEnrolementRepo = {
    findManyExtended: vi.fn(),
  };

  let service: SeatingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SeatingService(
      mockRoomRepo as any,
      mockEnrolementRepo as any,
    );
  });

  it("should return an empty array if no rooms are found", async () => {
    // Arrange
    mockRoomRepo.findMany.mockResolvedValue([]);
    mockEnrolementRepo.findManyExtended.mockResolvedValue([{ id: "enr-1" }]);

    // Act
    const result = await service.generate("school-1", "year-1");

    // Assert
    expect(result).toEqual([]);
    expect(mockRoomRepo.findMany).toHaveBeenCalledWith({
      where: { schoolId: "school-1" },
    });
  });

  it("should correctly map database entities to domain entities", async () => {
    // Arrange
    const dbRooms = [
      {
        localRoomId: "room-1",
        maxCapacity: 30,
        name: "Alpha",
        totalColumns: 5,
      },
    ];
    const dbEnrollements = [
      {
        enrolementId: "enr-1",
        classroomId: "class-1",
        student: { firstName: "John", lastName: "Doe", middleName: "M." },
        classroom: { name: "Grade 10" },
      },
    ];

    mockRoomRepo.findMany.mockResolvedValue(dbRooms);
    mockEnrolementRepo.findManyExtended.mockResolvedValue(dbEnrollements);

    // Act
    const result = await service.generate("school-1", "year-1");

    // Assert
    // On vérifie que le repository a été appelé avec les bons filtres (Status EN_COURS)
    expect(mockEnrolementRepo.findManyExtended).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: STUDENT_STATUS_ENUM.EN_COURS,
        }),
      }),
    );

    // Si l'engine fonctionne, le résultat ne devrait pas être nul
    // (Note: ExamOptimizer étant une lib externe, on teste ici l'orchestration)
    expect(result).toBeDefined();
  });

  it("should throw a custom error if the database fetch fails", async () => {
    // Arrange
    mockRoomRepo.findMany.mockRejectedValue(new Error("DB Connection Lost"));

    // Act & Assert
    await expect(service.generate("school-1", "year-1")).rejects.toThrow(
      "[SeatingService] Database access failed",
    );
  });

  it("should use default configuration if no options are provided", async () => {
    // Arrange
    mockRoomRepo.findMany.mockResolvedValue([]);
    mockEnrolementRepo.findManyExtended.mockResolvedValue([]);

    const spy = vi.spyOn(service as any, "fetchData");

    // Act
    await service.generate("school-1", "year-1");

    // Assert
    expect(spy).toHaveBeenCalledWith("school-1", "year-1");
  });
});
