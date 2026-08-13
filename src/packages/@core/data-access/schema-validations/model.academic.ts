import { z } from "zod";
import {
  ZSECTION_ENUM,
  ZUSER_GENDER_ENUM,
  ZUSER_ROLE_ENUM,
  ZSTUDENT_STATUS_ENUM,
  ZENROLLMENT_ACTION_ENUM,
  schoolIdBaseSchema,
  schoolYearIdBaseSchema,
  timestampBaseSchema,
  optionalNullableString,
} from "./model.base";

/* =========================================================================
   CORE SCHEMAS
   ========================================================================= */

/**
 * Zod schema representing a complete School entity.
 */
export const SchoolSchema = z
  .object({
    schoolId: z
      .string()
      .min(1)
      .describe("Unique identifier of the school (UUID)"),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long.")
      .max(255)
      .describe("Full name of the school"),
    address: z
      .string()
      .min(3, "Address is required.")
      .max(255)
      .describe("Physical address of the school"),
    town: z
      .string()
      .min(2, "Town is required.")
      .max(100)
      .describe("Town where the school is located"),
    logo: optionalNullableString.describe("URL or file path to the logo"),
  })
  .extend(timestampBaseSchema.shape);

/** Type representing a complete School record. */
export type School = z.infer<typeof SchoolSchema>;

/**
 * Zod schema representing a complete User entity.
 */
export const UserSchema = z
  .object({
    userId: z.string().min(1).describe("Unique identifier of the user"),
    lastName: z
      .string()
      .min(2, "Last name is required.")
      .max(100)
      .describe("Last name"),
    middleName: z
      .string()
      .min(2, "Middle name is required.")
      .max(100)
      .describe("Middle name"),
    firstName: optionalNullableString.describe("First name"),
    username: z
      .string()
      .min(3, "Username is required.")
      .max(50)
      .describe("Unique username"),
    password: z
      .string()
      .min(6, "Password must contain at least 6 characters.")
      .max(255)
      .describe("User password"),
    gender: ZUSER_GENDER_ENUM.describe("User gender"),
    role: ZUSER_ROLE_ENUM.describe("User role within the school"),
    birthDate: z
      .date()
      .nullable()
      .optional()
      .describe("Birth date (ISO format)"),
    birthPlace: optionalNullableString.describe("Birth place"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

/** Type representing a complete User record. */
export type User = z.infer<typeof UserSchema>;

/**
 * Zod schema representing a complete Tutor entity.
 */
export const TutorSchema = z
  .object({
    tutorId: z
      .string()
      .min(1)
      .describe("Unique identifier of the tutor (UUID)"),
    profession: optionalNullableString.describe(
      "Professional occupation of the tutor",
    ),
    address: optionalNullableString.describe(
      "Physical living address of the tutor",
    ),
    phoneNumber: optionalNullableString.describe(
      "Primary contact phone number",
    ),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

/** Type representing a complete Tutor record. */
export type Tutor = z.infer<typeof TutorSchema>;

/**
 * Zod schema representing an Option entity.
 */
export const OptionSchema = z
  .object({
    optionId: z.string().min(1).describe("Unique identifier of the option"),
    optionName: z
      .string()
      .min(2, "Name is required.")
      .max(100)
      .describe("Full option name"),
    optionShortName: z
      .string()
      .min(1, "Short code is required.")
      .max(10)
      .describe("Short option code"),
    section: ZSECTION_ENUM.describe("Section to which the option belongs"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

/** Type representing a complete Option record. */
export type Option = z.infer<typeof OptionSchema>;

/**
 * Zod schema representing a Study Year entity.
 */
export const StudyYearSchema = z
  .object({
    yearId: z.string().min(1).describe("Unique identifier of the study year"),
    yearName: z
      .string()
      .min(4, "E.g. 2025-2026")
      .max(50)
      .describe("Academic year label"),
    startDate: z.date().nullable().optional().describe("Start date (ISO)"),
    endDate: z.date().nullable().optional().describe("End date (ISO)"),
  })
  .extend(timestampBaseSchema.shape);

/** Type representing a complete StudyYear record. */
export type StudyYear = z.infer<typeof StudyYearSchema>;

/**
 * Zod schema representing a Classroom entity.
 */
export const ClassroomSchema = z
  .object({
    classId: z.string().min(1).describe("Unique identifier of the classroom"),
    identifier: z
      .string()
      .min(1, "Identifier is required.")
      .max(50)
      .describe("Full classroom identifier"),
    shortIdentifier: z
      .string()
      .min(1, "Short identifier is required.")
      .max(10)
      .describe("Short classroom identifier"),
    section: ZSECTION_ENUM.describe("Classroom section"),
    optionId: optionalNullableString.describe("Associated option identifier"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

/** Type representing a complete Classroom record. */
export type Classroom = z.infer<typeof ClassroomSchema>;

/**
 * Zod schema representing a Classroom Enrollment entity.
 */
export const EnrollmentSchema = z
  .object({
    enrollmentId: z
      .string()
      .min(1)
      .describe("Unique identifier of the enrollment"),
    classroomId: z
      .string()
      .min(1, "Classroom is required.")
      .describe("Associated classroom"),
    studentId: z
      .string()
      .min(1, "Student is required.")
      .describe("Associated student"),
    tutorId: optionalNullableString.describe("Associated tutor identifier"),
    status: ZSTUDENT_STATUS_ENUM.describe("Student enrollment status"),
    isNewStudent: z.boolean().describe("Flag indicating if new student"),
    studentCode: z.string().max(50).describe("Student enrollment code"),
  })
  .extend(schoolYearIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

/** Type representing a complete Enrollment record. */
export type Enrollment = z.infer<typeof EnrollmentSchema>;

/**
 * Zod schema representing an Enrollment Audit Action entity.
 */
export const EnrollmentActionSchema = z
  .object({
    actionId: z.string().min(1).describe("Unique identifier of the action"),
    enrollmentId: z
      .string()
      .min(1, "Enrollment is required.")
      .describe("Associated enrollment"),
    action: ZENROLLMENT_ACTION_ENUM.describe("Performed action type"),
    reason: optionalNullableString.describe("Reason for action"),
  })
  .extend(timestampBaseSchema.shape);

/** Type representing an EnrollmentAction audit record. */
export type EnrollmentAction = z.infer<typeof EnrollmentActionSchema>;

/* =========================================================================
   CREATE / UPDATE DERIVED SCHEMAS
   ========================================================================= */

/** Creation payload schema for School records. */
export const SchoolCreateSchema = SchoolSchema.omit({
  schoolId: true,
  createdAt: true,
  updatedAt: true,
});
export type SchoolCreate = z.infer<typeof SchoolCreateSchema>;

/** Update payload schema for School records. */
export const SchoolUpdateSchema = SchoolCreateSchema.partial();
export type SchoolUpdate = z.infer<typeof SchoolUpdateSchema>;

/** Creation payload schema for User records. */
export const UserCreateSchema = UserSchema.omit({
  userId: true,
  username: true,
  createdAt: true,
  updatedAt: true,
});
export type UserCreate = z.infer<typeof UserCreateSchema>;

/** Update payload schema for User records. */
export const UserUpdateSchema = UserCreateSchema.omit({
  schoolId: true,
}).partial();
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

/** Creation payload schema for Tutor records. */
export const TutorCreateSchema = TutorSchema.omit({
  tutorId: true,
  createdAt: true,
  updatedAt: true,
});
export type TutorCreate = z.infer<typeof TutorCreateSchema>;

/** Update payload schema for Tutor records. */
export const TutorUpdateSchema = TutorCreateSchema.omit({
  schoolId: true,
}).partial();
export type TutorUpdate = z.infer<typeof TutorUpdateSchema>;

/** Creation payload schema for Option records. */
export const OptionCreateSchema = OptionSchema.omit({
  optionId: true,
  createdAt: true,
  updatedAt: true,
});
export type OptionCreate = z.infer<typeof OptionCreateSchema>;

/** Update payload schema for Option records. */
export const OptionUpdateSchema = OptionCreateSchema.omit({
  schoolId: true,
}).partial();
export type OptionUpdate = z.infer<typeof OptionUpdateSchema>;

/** Creation payload schema for StudyYear records. */
export const StudyYearCreateSchema = StudyYearSchema.omit({
  yearId: true,
  createdAt: true,
  updatedAt: true,
});
export type StudyYearCreate = z.infer<typeof StudyYearCreateSchema>;

/** Update payload schema for StudyYear records. */
export const StudyYearUpdateSchema = StudyYearCreateSchema.partial();
export type StudyYearUpdate = z.infer<typeof StudyYearUpdateSchema>;

/** Creation payload schema for Classroom records. */
export const ClassroomCreateSchema = ClassroomSchema.omit({
  classId: true,
  createdAt: true,
  updatedAt: true,
});
export type ClassroomCreate = z.infer<typeof ClassroomCreateSchema>;

/** Update payload schema for Classroom records. */
export const ClassroomUpdateSchema = ClassroomCreateSchema.omit({
  schoolId: true,
}).partial();
export type ClassroomUpdate = z.infer<typeof ClassroomUpdateSchema>;

/** Creation payload schema for Enrollment records. */
export const EnrollmentCreateSchema = EnrollmentSchema.omit({
  enrollmentId: true,
  studentCode: true,
  createdAt: true,
  updatedAt: true,
});
export type EnrollmentCreate = z.infer<typeof EnrollmentCreateSchema>;

/** Update payload schema for Enrollment records. */
export const EnrollmentUpdateSchema = EnrollmentCreateSchema.omit({
  schoolId: true,
  yearId: true,
  studentId: true,
}).partial();
export type EnrollmentUpdate = z.infer<typeof EnrollmentUpdateSchema>;

/** Creation payload schema for EnrollmentAction audit logs. */
export const EnrollmentActionCreateSchema = EnrollmentActionSchema.omit({
  actionId: true,
  createdAt: true,
  updatedAt: true,
});
export type EnrollmentActionCreate = z.infer<
  typeof EnrollmentActionCreateSchema
>;

/* =========================================================================
   BASE SCHEMAS
   ========================================================================= */

// Assurez-vous que UserCreateSchema est un z.object direct
export const BasePersonSchema = UserCreateSchema.omit({
  schoolId: true,
  role: true,
  password: true,
});
export type BasePerson = z.infer<typeof BasePersonSchema>;

export const BaseStudentSchema = BasePersonSchema;
export type BaseStudent = z.infer<typeof BaseStudentSchema>;

export const BaseTutorSchema = TutorCreateSchema.omit({
  schoolId: true,
}).merge(BasePersonSchema); // .merge() est souvent plus propre que .extend(shape)

export type BaseTutor = z.infer<typeof BaseTutorSchema>;

/* =========================================================================
   SUB-UNIONS (STUDENT & TUTOR)
   ========================================================================= */

// 1. Gestion Élève (Discriminated Union propre)
const ExistingStudentSchema = z.object({
  isInSystem: z.literal(true),
  studentId: z.string().min(1, "Student ID is required."),
});

const NewStudentSchema = z.object({
  isInSystem: z.literal(false),
  student: BaseStudentSchema,
});

export const StudentInputSchema = z.discriminatedUnion("isInSystem", [
  ExistingStudentSchema,
  NewStudentSchema,
]);

// 2. Gestion Tuteur (Discriminated Union propre + Cas Optionnel)
const ExistingTutorSchema = z.object({
  isTutorInSystem: z.literal(true),
  tutorId: z.string().min(1, "Tutor ID is required."),
});

const NewTutorSchema = z.object({
  isTutorInSystem: z.literal(false),
  tutor: BaseTutorSchema,
});

// const NoTutorSchema = z.object({
//   isTutorInSystem: z.literal(null).optional(),
// });

export const TutorQuickInputSchema = z.discriminatedUnion("isTutorInSystem", [
  ExistingTutorSchema,
  NewTutorSchema,
  // Astuce : On peut aussi gérer le cas "Pas de tuteur" proprement
]);

/* =========================================================================
   ENROLLMENT SCHEMA FINAL
   ========================================================================= */

const BaseEnrollmentSchema = EnrollmentCreateSchema.omit({
  studentId: true,
  tutorId: true,
});

// Composition propre sans z.intersection toxique
export const EnrollmentQuickCreateSchema = BaseEnrollmentSchema.and(
  z.object({
    studentData: StudentInputSchema,
    tutorData: TutorQuickInputSchema.optional(),
  }),
);

export type EnrollmentQuickCreate = z.infer<typeof EnrollmentQuickCreateSchema>;
