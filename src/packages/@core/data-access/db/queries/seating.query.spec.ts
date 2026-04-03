import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  seatingAssignmentService,
  seatingSessionService,
} from "./seating.query";
import { db } from "../config";

// On "mock" (simule) la base de données
vi.mock("../config", () => ({
  db: {
    transaction: vi.fn(),
    select: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]), // Valeur par défaut résolue
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(true),
    })),
    query: {
      seatingSessions: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe("Seating Services", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // On nettoie les mocks avant chaque test
  });

  describe("SeatingAssignmentQuery", () => {
    it("bulkAssign - devrait retourner un tableau vide si aucune assignation n'est passée", async () => {
      const result = await seatingAssignmentService.bulkAssign([]);
      expect(result).toEqual([]);
      expect(db.transaction).not.toHaveBeenCalled();
    });

    it("bulkAssign - devrait exécuter une transaction pour des assignations valides", async () => {
      const mockAssignments = [
        {
          sessionId: "s1",
          localRoomId: "r1",
          enrolementId: "e1",
          rowPosition: 1,
          columnPosition: 1,
        },
      ];

      // On simule le succès de la transaction
      (db.transaction as any).mockImplementation(async (cb: any) => {
        return cb({
          insert: () => ({
            values: () => ({
              returning: () => Promise.resolve(mockAssignments),
            }),
          }),
        });
      });

      const result = await seatingAssignmentService.bulkAssign(mockAssignments);
      expect(result).toEqual(mockAssignments);
      expect(db.transaction).toHaveBeenCalledTimes(1);
    });

    it("clearRoomAssignments - devrait appeler delete avec les bons paramètres", async () => {
      const result = await seatingAssignmentService.clearRoomAssignments(
        "session-1",
        "room-1",
      );
      expect(result).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("SeatingSessionQuery", () => {
    it("getFullSessionDetails - devrait trier les élèves par ordre alphabétique en mémoire", async () => {
      // Mock des données renvoyées par la DB non triées
      const mockUnsortedData = {
        sessionId: "s1",
        assignments: [
          {
            enrolement: { user: { lastName: "Zidane", firstName: "Zinedine" } },
          },
          { enrolement: { user: { lastName: "Mbappe", firstName: "Kylian" } } },
          { enrolement: { user: { lastName: "Henry", firstName: "Thierry" } } },
        ],
      };

      (db.query.seatingSessions.findFirst as any).mockResolvedValue(
        mockUnsortedData,
      );

      const result = await seatingSessionService.getFullSessionDetails("s1");

      // On vérifie que la fonction a bien trié le tableau !
      expect(result.assignments.enrolement.user.lastName).toBe("Henry");
      expect(result.assignments.enrolement.user.lastName).toBe("Mbappe");
      expect(result.assignments.enrolement.user.lastName).toBe("Zidane");
    });
  });
});
