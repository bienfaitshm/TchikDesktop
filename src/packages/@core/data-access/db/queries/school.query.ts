import { schools, studyYears } from "../schemas/schema";
import { BaseRepository } from "./base-repository";
import type {
  TSchool,
  TSchoolInsert,
  TSchoolUpdate,
  TStudyYear,
  TStudyYearInsert,
  TStudyYearUpdate,
} from "../schemas/types";

/**
 * Gestion des Écoles
 */
export class SchoolQuery extends BaseRepository<
  typeof schools,
  TSchool,
  TSchoolInsert,
  TSchoolUpdate
> {
  constructor() {
    super(schools, schools.schoolId, "School", {
      orderBy: [{ column: "name", order: "asc" }],
    });
  }

  static instance = new SchoolQuery();
}

/**
 * Gestion des Années Scolaires
 */
export class StudyYearQuery extends BaseRepository<
  typeof studyYears,
  TStudyYear,
  TStudyYearInsert,
  TStudyYearUpdate
> {
  constructor() {
    super(studyYears, studyYears.yearId, "StudyYear", {
      orderBy: [
        { column: "yearName", order: "desc" },
        { column: "startDate", order: "desc" },
      ],
    });
  }

  static instance = new StudyYearQuery();
}

// Export pour utilisation directe (Pattern Singleton)
export const schoolService = SchoolQuery.instance;
export const studyYearService = StudyYearQuery.instance;
