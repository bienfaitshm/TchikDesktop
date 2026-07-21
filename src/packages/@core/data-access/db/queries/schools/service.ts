import type { TDataBase } from "@/packages/@core/data-access/db/config";
import { schoolRepository, SchoolRepository } from "./school.repository";
import {
  studyYearRepository,
  StudyYearRepository,
} from "./study-year.repository";

export class SchoolInfoService {
  constructor(
    private schoolRepo: SchoolRepository,
    private yearRepo: StudyYearRepository,
  ) {}
  getSchoolInfos(schoolId: string, yearId: string, tx?: TDataBase) {
    const school = this.schoolRepo.findById(schoolId, tx);
    const year = this.yearRepo.findById(yearId, tx);

    return { ...school, studyYear: year };
  }
}

export const schoolInfoService = new SchoolInfoService(
  schoolRepository,
  studyYearRepository,
);
