import { describe, it, expect, vi, afterEach } from "vitest";
import { StatsService } from "@/main/db/services/stats.service";
import { User, ClassroomEnrolement } from "@/packages/@core/data-access/db";
import { USER_ROLE, STUDENT_STATUS } from "@/commons/constants/enum";

// --- Configuration des constantes ---
const MOCK_SCHOOL_ID = "sch-100";
const MOCK_YEAR_ID = "yr-2025";

// --- Mock des modèles Sequelize ---
vi.mock("../models", () => ({
  User: { count: vi.fn(), findAll: vi.fn() },
  ClassroomEnrolement: { count: vi.fn(), findAll: vi.fn() },
  ClassRoom: { findAll: vi.fn() },
  Option: {}, // Non utilisé directement dans les appels mockés ici
  sequelize: {
    fn: vi.fn((name) => name),
    col: vi.fn((name) => name),
  },
}));

describe("StatsService", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks(); // Important pour les spyOn
  });

  // =============================================================================
  //  MÉTRIQUES DE BASE (COMPTAGES SIMPLES)
  // =============================================================================

  describe("getTotalStudents", () => {
    it("doit retourner le nombre total d'étudiants pour une école donnée", async () => {
      vi.mocked(User.count).mockResolvedValue(150);

      const result = await StatsService.getTotalStudents(MOCK_SCHOOL_ID);

      expect(User.count).toHaveBeenCalledWith({
        where: { schoolId: MOCK_SCHOOL_ID, role: USER_ROLE.STUDENT },
      });
      expect(result).toBe(150);
    });

    it("doit lever une erreur 'Service unavailable' en cas d'échec DB", async () => {
      vi.mocked(User.count).mockRejectedValue(
        new Error("Database connection lost"),
      );

      await expect(
        StatsService.getTotalStudents(MOCK_SCHOOL_ID),
      ).rejects.toThrow("Service unavailable");
    });
  });

  describe("getStudentCountByGender", () => {
    it("doit agréger le nombre d'étudiants par genre (M/F)", async () => {
      const mockData = [
        { gender: "M", count: 80 },
        { gender: "F", count: 70 },
      ];
      vi.mocked(User.findAll).mockResolvedValue(mockData as any);

      const result = await StatsService.getStudentCountByGender(MOCK_SCHOOL_ID);

      expect(result).toEqual({ M: 80, F: 70 });
      expect(User.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schoolId: MOCK_SCHOOL_ID, role: USER_ROLE.STUDENT },
        }),
      );
    });
  });

  describe("getNewStudentsCount", () => {
    it("doit compter uniquement les nouveaux étudiants", async () => {
      vi.mocked(ClassroomEnrolement.count).mockResolvedValue(25);

      const result = await StatsService.getNewStudentsCount(MOCK_SCHOOL_ID);

      expect(ClassroomEnrolement.count).toHaveBeenCalledWith({
        where: { schoolId: MOCK_SCHOOL_ID, isNewStudent: true },
      });
      expect(result).toBe(25);
    });
  });

  // =============================================================================
  //  AGRÉGATIONS COMPLEXES (JOINTURES ET GROUPES)
  // =============================================================================

  describe("getStudentsCountByClass", () => {
    it("doit retourner les stats par classe avec les noms formattés", async () => {
      const mockDbRows = [
        {
          classroomId: "c1",
          studentCount: 35,
          "ClassRoom.identifier": "4e A",
          "ClassRoom.shortIdentifier": "4A",
        },
      ];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(
        mockDbRows as any,
      );

      const result = await StatsService.getStudentsCountByClass(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID,
      );

      expect(result[0]).toEqual({
        classId: "c1",
        className: "4e A",
        shortName: "4A",
        studentCount: 35,
      });
      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ raw: true }),
      );
    });

    it("doit rejeter la requête si schoolId ou yearId est manquant", async () => {
      // @ts-ignore : Test de la sécurité runtime
      await expect(
        StatsService.getStudentsCountByClass(MOCK_SCHOOL_ID),
      ).rejects.toThrow("Validation Error");
    });
  });

  describe("getStudentCountByStatus", () => {
    it("doit mapper les résultats Sequelize en objet de statut clé-valeur", async () => {
      const mockData = [
        { status: STUDENT_STATUS.EN_COURS, count: 140 },
        { status: STUDENT_STATUS.EXCLUT, count: 10 },
      ];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(mockData as any);

      const result = await StatsService.getStudentCountByStatus(MOCK_SCHOOL_ID);

      expect(result).toEqual({ EN_COURS: 140, EXCLUT: 10 });
    });
  });

  describe("getStudentsCountByOption", () => {
    it("doit grouper les étudiants par nom d'option", async () => {
      const mockResult = [
        { studentCount: 70, "ClassRoom.Option.optionName": "Sciences" },
      ];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(
        mockResult as any,
      );

      const result = await StatsService.getStudentsCountByOption(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID,
      );

      expect(result).toEqual([{ optionName: "Sciences", studentCount: 70 }]);
      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ group: ["ClassRoom.Option.optionName"] }),
      );
    });
  });

  // =============================================================================
  //  LOGIQUE MÉTIER ET CALCULS (KPIs)
  // =============================================================================

  describe("getGenderRatio", () => {
    it("doit calculer correctement le ratio Garçons/Filles", async () => {
      // On espionne la méthode interne du service
      const spy = vi
        .spyOn(StatsService, "getStudentCountByGender")
        .mockResolvedValue({ M: 80, F: 20 });

      const ratio = await StatsService.getGenderRatio(MOCK_SCHOOL_ID);

      expect(ratio).toBe(4); // 80 / 20
      expect(spy).toHaveBeenCalled();
    });

    it("doit retourner Infinity si aucune fille n'est enregistrée (division par zéro)", async () => {
      vi.spyOn(StatsService, "getStudentCountByGender").mockResolvedValue({
        M: 50,
        F: 0,
      });

      const ratio = await StatsService.getGenderRatio(MOCK_SCHOOL_ID);
      expect(ratio).toBe(Infinity);
    });
  });

  describe("getRetentionRate", () => {
    it("doit calculer le taux de rétention (Anciens / Total)", async () => {
      // Premier appel : Total des inscriptions
      vi.mocked(ClassroomEnrolement.count).mockResolvedValueOnce(100);
      // Deuxième appel : Nouveaux étudiants
      vi.mocked(ClassroomEnrolement.count).mockResolvedValueOnce(20);

      const rate = await StatsService.getRetentionRate(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID,
      );

      // Calcul : (100 - 20) / 100 = 0.8
      expect(rate).toBe(0.8);
      expect(ClassroomEnrolement.count).toHaveBeenCalledTimes(2);
    });

    it("doit retourner 0 si l'école n'a aucun inscrit", async () => {
      vi.mocked(ClassroomEnrolement.count).mockResolvedValue(0);

      const rate = await StatsService.getRetentionRate(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID,
      );
      expect(rate).toBe(0);
    });
  });
});
