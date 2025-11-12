import type {
  ClassGenderCount,
  TotalStudentCount,
  OptionStudentCount,
  SectionStudentCount,
} from "@/commons/types/services";

import type {
  ProcessedClassGenderCount,
  ProcessedOptionStudentCount,
  ProcessedSectionStudentCount,
  ProcessedTotalStudentCount,
} from "@/commons/types/services.process";

export async function processClassGenderCount(
  dataPromise: Promise<ClassGenderCount[]>
): Promise<ProcessedClassGenderCount[]> {
  const data = await dataPromise;
  return data.map((d) => ({
    classId: d.classId,
    name: d.identifier,
    shortName: d.shortIdentifier,
    male: d.maleCount,
    female: d.femaleCount,
    total: d.femaleCount + d.maleCount,
  }));
}

export async function processTotalStudentCount(
  dataPromise: Promise<TotalStudentCount>
): Promise<ProcessedTotalStudentCount> {
  const data = await dataPromise;
  return {
    female: data.femaleCount,
    male: data.maleCount,
    total: data.studentCount,
  };
}

export async function processOptionStudentCount(
  dataPromise: Promise<OptionStudentCount[]>
): Promise<ProcessedOptionStudentCount[]> {
  const data = await dataPromise;
  return data.map((d) => ({
    female: d.femaleCount,
    male: d.maleCount,
    total: d.studentCount,
    name: d.optionName,
    shortName: d.optionShortName,
  }));
}

export async function processSectionStudentCount(
  dataPromise: Promise<SectionStudentCount[]>
): Promise<ProcessedSectionStudentCount[]> {
  const data = await dataPromise;
  return data.map((d) => ({
    female: d.femaleCount,
    male: d.maleCount,
    total: d.studentCount,
    section: d.section,
  }));
}
