// tests/services/stats.service.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { StatsService } from "@/main/db/services/stats.service";
import { User, ClassroomEnrolement, ClassRoom, Option } from "../models";
import { USER_ROLE, STUDENT_STATUS } from "@/commons/constants/enum";
import { literal, fn, col } from "sequelize";

// Constantes de mock
const MOCK_SCHOOL_ID = "sch-100";
const MOCK_YEAR_ID = "yr-2025";

// Mocker les modèles Sequelize
vi.mock("../models", () => ({
  User: { count: vi.fn(), findAll: vi.fn() },
  ClassroomEnrolement: { count: vi.fn(), findAll: vi.fn() },
  ClassRoom: { findAll: vi.fn() },
  Option: {},
  sequelize: {
    fn: vi.fn((name, ...args) => ({ name, args })),
    col: vi.fn((name) => ({ name })),
  },
}));

// Helper pour simuler la transformation des résultats agrégés
const mockRawResult = (data: { [key: string]: string | number }[]) =>
  data.map((item) => ({ ...item, get: vi.fn((key) => item[key]) }));

describe("StatsService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // =============================================================================
  //  MÉTRIQUES DE BASE
  // =============================================================================

  describe("getTotalStudents", () => {
    it("should return the total count of students", async () => {
      vi.mocked(User.count).mockResolvedValue(150 as any);

      const result = await StatsService.getTotalStudents(MOCK_SCHOOL_ID);

      expect(User.count).toHaveBeenCalledWith({
        where: { schoolId: MOCK_SCHOOL_ID, role: USER_ROLE.STUDENT },
      });
      expect(result).toBe(150);
    });

    it("should throw error on DB failure", async () => {
      vi.mocked(User.count).mockRejectedValue(new Error("DB error"));

      await expect(
        StatsService.getTotalStudents(MOCK_SCHOOL_ID)
      ).rejects.toThrow("Service unavailable");
    });
  });

  describe("getStudentCountByGender", () => {
    it("should aggregate student count by gender", async () => {
      // Arrange: Simuler les résultats raw de Sequelize
      const mockData = [
        { gender: "M", count: 80 },
        { gender: "F", count: 70 },
      ];
      vi.mocked(User.findAll).mockResolvedValue(mockData as any);

      // Act
      const result = await StatsService.getStudentCountByGender(MOCK_SCHOOL_ID);

      // Assert
      expect(User.findAll).toHaveBeenCalled();
      expect(result).toEqual({ M: 80, F: 70 });
    });
  });

  describe("getNewStudentsCount", () => {
    it("should return the count of students marked as new", async () => {
      vi.mocked(ClassroomEnrolement.count).mockResolvedValue(25 as any);

      const result = await StatsService.getNewStudentsCount(MOCK_SCHOOL_ID);

      expect(ClassroomEnrolement.count).toHaveBeenCalledWith({
        where: { schoolId: MOCK_SCHOOL_ID, isNewStudent: true },
      });
      expect(result).toBe(25);
    });
  });

  // =============================================================================
  //  MÉTRIQUES D'AGRÉGATION AVEC JOINTURES
  // =============================================================================

  describe("getStudentsCountByClass", () => {
    it("should retrieve student counts by class identifier", async () => {
      // Arrange
      const mockResult = [
        {
          classroomId: "c1",
          studentCount: 35,
          "ClassRoom.identifier": "4e A",
          "ClassRoom.shortIdentifier": "4A",
        },
        {
          classroomId: "c2",
          studentCount: 45,
          "ClassRoom.identifier": "4e B",
          "ClassRoom.shortIdentifier": "4B",
        },
      ];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(
        mockResult as any
      );

      // Act
      const result = await StatsService.getStudentsCountByClass(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        classId: "c1",
        className: "4e A",
        shortName: "4A",
        studentCount: 35,
      });
      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: ClassRoom,
              required: true,
              where: { yearId: MOCK_YEAR_ID },
            }),
          ]),
          raw: true,
        })
      );
    });

    it("should throw validation error if schoolId or yearId is missing", async () => {
      // @ts-ignore
      await expect(
        StatsService.getStudentsCountByClass(MOCK_SCHOOL_ID)
      ).rejects.toThrow("Validation Error");
    });
  });

  describe("getStudentCountByStatus", () => {
    it("should aggregate student count by enrollment status", async () => {
      // Arrange
      const mockData = [
        { status: STUDENT_STATUS.EN_COURS, count: 140 },
        { status: STUDENT_STATUS.EXCLUT, count: 10 },
      ];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(mockData as any);

      // Act
      const result = await StatsService.getStudentCountByStatus(MOCK_SCHOOL_ID);

      // Assert
      expect(result).toEqual({ EN_COURS: 140, EXCLUT: 10 });
      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schoolId: MOCK_SCHOOL_ID },
          group: ["status"],
          raw: true,
        })
      );
    });
  });

  describe("getStudentsCountByOption", () => {
    it("should retrieve student counts by option name", async () => {
      // Arrange
      const mockResult = [
        { studentCount: 70, "ClassRoom.Option.optionName": "Scientifique" },
        { studentCount: 80, "ClassRoom.Option.optionName": "Littéraire" },
      ];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(
        mockResult as any
      );

      // Act
      const result = await StatsService.getStudentsCountByOption(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { optionName: "Scientifique", studentCount: 70 },
        { optionName: "Littéraire", studentCount: 80 },
      ]);
      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          group: ["ClassRoom.Option.optionName"],
        })
      );
    });
  });

  describe("getClassCountBySection", () => {
    it("should aggregate class count by section", async () => {
      // Arrange
      const mockData = [
        { section: "Primaire", count: 6 },
        { section: "Secondaire", count: 10 },
      ];
      vi.mocked(ClassRoom.findAll).mockResolvedValue(mockData as any);

      // Act
      const result = await StatsService.getClassCountBySection(MOCK_SCHOOL_ID);

      // Assert
      expect(result).toEqual({ Primaire: 6, Secondaire: 10 });
    });
  });

  // =============================================================================
  //  MÉTHODES AVANCÉES (TENDANCES ET KPIS)
  // =============================================================================

  describe("getGenderRatio", () => {
    it("should calculate the correct Male/Female ratio", async () => {
      // Mock the dependency call
      const getStudentCountByGenderSpy = vi.spyOn(
        StatsService,
        "getStudentCountByGender"
      );
      getStudentCountByGenderSpy.mockResolvedValue({ M: 80, F: 20 });

      const ratio = await StatsService.getGenderRatio(MOCK_SCHOOL_ID);
      expect(ratio).toBe(4); // 80 / 20 = 4
    });

    it("should handle division by zero (no females)", async () => {
      const getStudentCountByGenderSpy = vi.spyOn(
        StatsService,
        "getStudentCountByGender"
      );
      getStudentCountByGenderSpy.mockResolvedValue({ M: 50, F: 0 });

      const ratio = await StatsService.getGenderRatio(MOCK_SCHOOL_ID);
      expect(ratio).toBe(Infinity);
    });
  });

  describe("getRetentionRate", () => {
    it("should calculate retention rate correctly (1 - New/Total)", async () => {
      // 1. Total Enrolments
      vi.mocked(ClassroomEnrolement.count).mockResolvedValueOnce(100 as any); // Total
      // 2. New Students
      vi.mocked(ClassroomEnrolement.count).mockResolvedValueOnce(20 as any); // New

      const rate = await StatsService.getRetentionRate(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID
      );

      // Retention (Non-New) = (100 - 20) / 100 = 80 / 100 = 0.8
      expect(rate).toBe(0.8);

      // Assure que les deux appels ont été faits avec les filtres corrects
      expect(vi.mocked(ClassroomEnrolement.count)).toHaveBeenCalledTimes(2);
      expect(
        vi.mocked(ClassroomEnrolement.count).mock.calls[1][0].where
      ).toMatchObject({ isNewStudent: true });
    });

    it("should return 0 if total enrolments is zero", async () => {
      vi.mocked(ClassroomEnrolement.count).mockResolvedValue(0 as any);

      const rate = await StatsService.getRetentionRate(
        MOCK_SCHOOL_ID,
        MOCK_YEAR_ID
      );
      expect(rate).toBe(0);
    });
  });
});
