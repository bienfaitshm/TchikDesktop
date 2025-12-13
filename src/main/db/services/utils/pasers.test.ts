import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import {
  formatReportForExcelExport,
  mapRawEnrollmentsToReportStructure,
} from "@/main/db/services/utils/parsers";
import {
  USER_GENDER,
  STUDENT_STATUS,
  STUDENT_STATUS_TRANSLATIONS,
} from "@/commons/constants/enum";

// Mocker les utilitaires externes
// const mockFormatDate = vi.fn((date) => `FORMATTED_DATE(${date.getFullYear()})`);

vi.mock("@/commons/libs/times", () => ({
  formatDate: vi.fn((date) => `FORMATTED_DATE(${date.getFullYear()})`),
}));

// Mocker l'utilitaire de tri pour des résultats prévisibles
// const mockSortStudentsByFullName = vi.fn((students) =>
//   students.sort((a: any, b: any) => a.lastName.localeCompare(b.lastName))
// );

vi.mock("./filters", () => ({
  sortStudentsByFullName: vi.fn((students) =>
    students.sort((a: any, b: any) => a.lastName.localeCompare(b.lastName))
  ),
}));

// Données de mock brutes de la DB (simulent EnrollmentData[])
const MOCK_RAW_ENROLLMENT_DATA = [
  {
    classId: "c-001",
    identifier: "3e Secondaire",
    shortIdentifier: "3SEC",
    ClassroomEnrolements: [
      {
        enrolementId: "e-101",
        code: "ENR-001",
        status: STUDENT_STATUS.EN_COURS,
        User: {
          userId: "u-101",
          gender: USER_GENDER.MALE,
          fullname: "DUBOIS Jean-Pierre",
          lastName: "DUBOIS",
          middleName: "Jean-Pierre",
          firstName: "Pierre",
          birthPlace: "Kinshasa",
          birthDate: new Date("2005-01-15T00:00:00.000Z"),
        },
      },
      {
        enrolementId: "e-102",
        code: "ENR-002",
        status: STUDENT_STATUS.EXCLUT,
        User: {
          userId: "u-102",
          gender: USER_GENDER.FEMALE,
          fullname: "AKOBA Marie",
          lastName: "AKOBA",
          middleName: "",
          firstName: "Marie",
          birthPlace: "Lubumbashi",
          birthDate: new Date("2006-05-20T00:00:00.000Z"),
        },
      },
    ],
  },
  {
    classId: "c-002",
    identifier: "4e Secondaire",
    shortIdentifier: "4SEC",
    ClassroomEnrolements: [
      {
        enrolementId: "e-201",
        code: "ENR-003",
        status: STUDENT_STATUS.EN_COURS,
        User: {
          userId: "u-201",
          gender: USER_GENDER.FEMALE,
          fullname: "ZOLA Béatrice",
          lastName: "ZOLA",
          middleName: "Béatrice",
          firstName: null, // Pas de prénom simple
          birthPlace: "Kolwezi",
          birthDate: null, // Pas de date de naissance
        },
      },
    ],
  },
];

describe("ReportService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("mapRawEnrollmentsToReportStructure", () => {
    it("should correctly map raw data into IClassroomReport structure", () => {
      // Act
      const reports = mapRawEnrollmentsToReportStructure(
        MOCK_RAW_ENROLLMENT_DATA as any
      );

      // Assert
      expect(reports).toHaveLength(2);

      // Vérification de la structure de la première classe
      expect(reports[0].classId).toBe("c-001");
      expect(reports[0].students).toHaveLength(2);
      expect(reports[0].students.length).toBe(2);

      // Vérification du tri (AKOBA avant DUBOIS, car sortStudentsByFullName est mocké pour trier par lastName)
      expect(reports[0].students[0].lastName).toBe("AKOBA");
      expect(reports[0].students[1].lastName).toBe("DUBOIS");

      // Vérification du mapping des champs
      const student1 = reports[0].students[1];
      expect(student1.gender).toBe(USER_GENDER.MALE);
      expect(student1.fullName).toBe("DUBOIS Jean-Pierre");
      expect(student1.status).toBe(STUDENT_STATUS.EN_COURS);
      expect(student1.enrollmentCode).toBe("ENR-001");
      expect(student1.birthPlace).toBe("Kinshasa");
    });
  });

  describe("formatReportForExcelExport", () => {
    let mockStructuredReports: any;

    beforeAll(() => {
      // Préparer une structure mappée pour le test de formatage
      mockStructuredReports = mapRawEnrollmentsToReportStructure(
        MOCK_RAW_ENROLLMENT_DATA as any
      );
    });

    it("should transform structured reports into a flat TExcelRow array", () => {
      // Act
      const excelRows = formatReportForExcelExport(mockStructuredReports);

      // Assert
      expect(excelRows).toHaveLength(3); // 2 étudiants dans la classe 1 + 1 étudiant dans la classe 2

      // Vérification du tri (AKOBA est le premier grâce au tri dans mapRawEnrollmentsToReportStructure)
      const firstRow = excelRows[0];

      // Vérification de la première ligne (AKOBA Marie)
      expect(firstRow["Nom de classe court"]).toBe("3SEC");
      expect(firstRow["Nom, postnom et Prénom"]).toBe("AKOBA Marie");
      expect(firstRow.Sexe).toBe(USER_GENDER.FEMALE);
      expect(firstRow.Statut).toBe(
        STUDENT_STATUS_TRANSLATIONS[STUDENT_STATUS.EXCLUT]
      ); // Vérifie la traduction
      expect(firstRow["Code d'inscription"]).toBe("ENR-002");
      expect(firstRow["Date de naissance"]).toBe("FORMATTED_DATE(2006)"); // Vérifie le formatage
    });

    it("should handle null or missing fields correctly", () => {
      // Act
      const excelRows = formatReportForExcelExport(mockStructuredReports);

      // ZOLA Béatrice (Troisième ligne) - Pas de prénom, pas de date de naissance
      const zolaRow = excelRows[2];

      // Assert
      expect(zolaRow["Nom de classe court"]).toBe("4SEC");
      expect(zolaRow.Prénom).toBe(""); // null -> ""
      expect(zolaRow["Date de naissance"]).toBe(""); // null -> ""
    });
  });

  // describe("generateReportSummary", () => {
  //   let mockStructuredReports: any;

  //   beforeAll(() => {
  //     // Simuler des statuts variés
  //     mockStructuredReports = [
  //       {
  //         studentCount: 3,
  //         students: [
  //           { gender: USER_GENDER.MALE, status: STUDENT_STATUS.EN_COURS },
  //           { gender: USER_GENDER.MALE, status: STUDENT_STATUS.EN_COURS },
  //           { gender: USER_GENDER.FEMALE, status: STUDENT_STATUS.EXCLUT },
  //         ],
  //       },
  //       {
  //         studentCount: 2,
  //         students: [
  //           { gender: USER_GENDER.FEMALE, status: STUDENT_STATUS.EN_COURS },
  //           { gender: USER_GENDER.MALE, status: STUDENT_STATUS.ABANDON },
  //         ],
  //       },
  //     ] as any;
  //   });

  //   // it("should calculate total students, gender counts, and status counts correctly", () => {
  //   //   // Act
  //   //   const summary = generateReportSummary(mockStructuredReports);

  //   //   // Assert
  //   //   // Total students: 3 + 2 = 5
  //   //   expect(summary.totalStudents).toBe(5);

  //   //   // Gender counts: M: 3, F: 2
  //   //   expect(summary.genderCounts).toEqual({
  //   //     [USER_GENDER.MALE]: 3,
  //   //     [USER_GENDER.FEMALE]: 2,
  //   //   });

  //   //   // Status counts: EN_COURS: 3, EXCLU: 1, TRANSF: 1
  //   //   expect(summary.statusCounts).toEqual({
  //   //     [STUDENT_STATUS.EN_COURS]: 3,
  //   //     [STUDENT_STATUS.EXCLUT]: 1,
  //   //     [STUDENT_STATUS.ABANDON]: 1,
  //   //   });
  //   // });

  //   // it("should return zeros/empty objects for empty report input", () => {
  //   //   // Act
  //   //   const summary = generateReportSummary([]);

  //   //   // Assert
  //   //   expect(summary.totalStudents).toBe(0);
  //   //   expect(summary.genderCounts).toEqual({});
  //   //   expect(summary.statusCounts).toEqual({});
  //   // });
  // });
});

function generateReportSummary(mockStructuredReports: any) {
  throw new Error("Function not implemented.");
}
