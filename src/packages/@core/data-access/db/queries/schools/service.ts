import type { TDataBase } from "@/packages/@core/data-access/db/config";
import { schoolRepository, SchoolRepository } from "./school.repository";
import {
  studyYearRepository,
  StudyYearRepository,
} from "./study-year.repository";
import { School, StudyYear } from "../../schemas";

/**
 * Aggregated structure combining school details with its associated study year.
 */
export type SchoolInfo = School & {
  studyYear: StudyYear;
};

/**
 * Service responsible for resolving and composing school information with academic year details.
 */
export class SchoolInfoService {
  /**
   * Initializes the service with required repositories.
   * @param schoolRepo - Repository instance for school data operations.
   * @param yearRepo - Repository instance for study year data operations.
   */
  constructor(
    private readonly schoolRepo: SchoolRepository,
    private readonly yearRepo: StudyYearRepository,
  ) {}

  /**
   * Retrieves a school entity and its study year by IDs and returns an aggregated object.
   * @param schoolId - Unique identifier of the target school.
   * @param yearId - Unique identifier of the target study year.
   * @param tx - Optional database transaction context.
   * @returns Aggregated school and study year details.
   * @throws Error when the school or study year cannot be found.
   */
  public getSchoolInfo(
    schoolId: string,
    yearId: string,
    tx?: TDataBase,
  ): SchoolInfo {
    const school = this.schoolRepo.findById(schoolId, tx);
    if (!school) {
      throw new Error(`School with ID "${schoolId}" not found.`);
    }

    const year = this.yearRepo.findById(yearId, tx);
    if (!year) {
      throw new Error(`Study year with ID "${yearId}" not found.`);
    }

    return { ...school, studyYear: year };
  }
}

/**
 * Default singleton instance of SchoolInfoService configured with default repositories.
 */
export const schoolInfoService = new SchoolInfoService(
  schoolRepository,
  studyYearRepository,
);
