import { z } from "zod";
import {
  SchoolAttributesSchema,
  UserAttributesSchema,
  OptionAttributesSchema,
  StudyYearAttributesSchema,
  ClassroomAttributesSchema,
  EnrolementAttributesSchema,
  EnrolementActionAttributesSchema,
  WithPaginationAndSortSchema,
} from "./model";

const orArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)]);

// =============================================================================
// I. SCHÉMAS DE FILTRE (Supportant Valeurs Simples ou Tableaux)
// =============================================================================

// 1. School Filter
export const SchoolFilterSchema = WithPaginationAndSortSchema(
  z.object({
    name: orArray(SchoolAttributesSchema.shape.name),
    adress: orArray(SchoolAttributesSchema.shape.adress),
    town: orArray(SchoolAttributesSchema.shape.town),
  })
);

// 2. User Filter
export const UserFilterSchema = WithPaginationAndSortSchema(
  z.object({
    userId: orArray(UserAttributesSchema.shape.userId.unwrap()), // On unwrap si optionnel/nullable
    lastName: orArray(UserAttributesSchema.shape.lastName),
    middleName: orArray(UserAttributesSchema.shape.middleName),
    firstName: orArray(UserAttributesSchema.shape.firstName.unwrap().unwrap()),
    gender: orArray(UserAttributesSchema.shape.gender.unwrap()),
    role: orArray(UserAttributesSchema.shape.role.unwrap()),
    schoolId: orArray(UserAttributesSchema.shape.schoolId.unwrap()),
  })
);

// 3. Option Filter
export const OptionFilterSchema = WithPaginationAndSortSchema(
  z.object({
    optionId: orArray(OptionAttributesSchema.shape.optionId),
    optionName: orArray(OptionAttributesSchema.shape.optionName),
    optionShortName: orArray(OptionAttributesSchema.shape.optionShortName),
    schoolId: orArray(OptionAttributesSchema.shape.schoolId),
    section: orArray(OptionAttributesSchema.shape.section.unwrap()),
  })
);

// 4. StudyYear Filter
export const StudyYearFilterSchema = WithPaginationAndSortSchema(
  z.object({
    yearId: orArray(StudyYearAttributesSchema.shape.yearId),
    yearName: orArray(StudyYearAttributesSchema.shape.yearName),
    schoolId: orArray(StudyYearAttributesSchema.shape.schoolId),
  })
);

// 5. Classroom Filter
export const ClassroomFilterSchema = WithPaginationAndSortSchema(
  z.object({
    classId: orArray(ClassroomAttributesSchema.shape.classId),
    identifier: orArray(ClassroomAttributesSchema.shape.identifier),
    yearId: orArray(ClassroomAttributesSchema.shape.yearId),
    schoolId: orArray(ClassroomAttributesSchema.shape.schoolId),
    section: orArray(ClassroomAttributesSchema.shape.section.unwrap()),
    optionId: orArray(
      ClassroomAttributesSchema.shape.optionId.unwrap().unwrap()
    ),
  })
);

// 6. Enrolement Filter
export const EnrolementFilterSchema = WithPaginationAndSortSchema(
  z.object({
    enrolementId: orArray(EnrolementAttributesSchema.shape.enrolementId),
    classroomId: orArray(EnrolementAttributesSchema.shape.classroomId),
    studentId: orArray(EnrolementAttributesSchema.shape.studentId),
    schoolId: orArray(EnrolementAttributesSchema.shape.schoolId),
    yearId: orArray(EnrolementAttributesSchema.shape.yearId),
    status: orArray(EnrolementAttributesSchema.shape.status.unwrap()),
  })
);

// 7. Enrolement Action Filter
export const EnrolementActionFilterSchema = WithPaginationAndSortSchema(
  z.object({
    actionId: orArray(EnrolementActionAttributesSchema.shape.actionId),
    enrolementId: orArray(EnrolementActionAttributesSchema.shape.enrolementId),
    action: orArray(EnrolementActionAttributesSchema.shape.action),
  })
);
