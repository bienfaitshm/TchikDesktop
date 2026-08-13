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
    schoolId: z
      .string()
      .min(1)
      .describe("Unique identifier of the associated school (UUID)"),
  })
  .extend(timestampBaseSchema.shape);

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

export type EnrollmentAction = z.infer<typeof EnrollmentActionSchema>;

/* =========================================================================
   CREATE / UPDATE DERIVED SCHEMAS
   ========================================================================= */

export const SchoolCreateSchema = SchoolSchema.omit({
  schoolId: true,
  createdAt: true,
  updatedAt: true,
});
export type SchoolCreate = z.infer<typeof SchoolCreateSchema>;

export const SchoolUpdateSchema = SchoolCreateSchema.partial();
export type SchoolUpdate = z.infer<typeof SchoolUpdateSchema>;

export const UserCreateSchema = UserSchema.omit({
  userId: true,
  username: true,
  createdAt: true,
  updatedAt: true,
});
export type UserCreate = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = UserCreateSchema.omit({
  schoolId: true,
}).partial();
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export const TutorCreateSchema = TutorSchema.omit({
  tutorId: true,
  createdAt: true,
  updatedAt: true,
});
export type TutorCreate = z.infer<typeof TutorCreateSchema>;

export const TutorUpdateSchema = TutorCreateSchema.omit({
  schoolId: true,
}).partial();
export type TutorUpdate = z.infer<typeof TutorUpdateSchema>;

export const OptionCreateSchema = OptionSchema.omit({
  optionId: true,
  createdAt: true,
  updatedAt: true,
});
export type OptionCreate = z.infer<typeof OptionCreateSchema>;

export const OptionUpdateSchema = OptionCreateSchema.omit({
  schoolId: true,
}).partial();
export type OptionUpdate = z.infer<typeof OptionUpdateSchema>;

export const StudyYearCreateSchema = StudyYearSchema.omit({
  yearId: true,
  createdAt: true,
  updatedAt: true,
});
export type StudyYearCreate = z.infer<typeof StudyYearCreateSchema>;

export const StudyYearUpdateSchema = StudyYearCreateSchema.partial();
export type StudyYearUpdate = z.infer<typeof StudyYearUpdateSchema>;

export const ClassroomCreateSchema = ClassroomSchema.omit({
  classId: true,
  createdAt: true,
  updatedAt: true,
});
export type ClassroomCreate = z.infer<typeof ClassroomCreateSchema>;

export const ClassroomUpdateSchema = ClassroomCreateSchema.omit({
  schoolId: true,
}).partial();
export type ClassroomUpdate = z.infer<typeof ClassroomUpdateSchema>;

export const EnrollmentCreateSchema = EnrollmentSchema.omit({
  enrollmentId: true,
  studentCode: true,
  createdAt: true,
  updatedAt: true,
});
export type EnrollmentCreate = z.infer<typeof EnrollmentCreateSchema>;

export const EnrollmentUpdateSchema = EnrollmentCreateSchema.omit({
  schoolId: true,
  yearId: true,
  studentId: true,
}).partial();
export type EnrollmentUpdate = z.infer<typeof EnrollmentUpdateSchema>;

export const EnrollmentActionCreateSchema = EnrollmentActionSchema.omit({
  actionId: true,
  createdAt: true,
  updatedAt: true,
});
export type EnrollmentActionCreate = z.infer<
  typeof EnrollmentActionCreateSchema
>;

/* =========================================================================
   QUICK ENROLLMENT & BULK SEATING
   ========================================================================= */

export const BaseStudentSchema = UserCreateSchema.omit({
  schoolId: true,
  role: true,
  password: true,
});
export type BaseStudent = z.infer<typeof BaseStudentSchema>;

export const BaseTutorSchema = TutorCreateSchema.omit({
  schoolId: true,
});
export type BaseTutor = z.infer<typeof BaseTutorSchema>;

const BaseEnrollmentSchemaWithoutStudent = EnrollmentCreateSchema.omit({
  studentId: true,
  tutorId: true,
});

/**
 * Union schema for handling tutor association in quick enrollment:
 * - Option 1: Existing tutor via `tutorId`
 * - Option 2: New tutor creation via `tutor` object
 * - Option 3: No tutor attached
 */
export const TutorQuickInputSchema = z.union([
  z.object({
    isTutorInSystem: z.literal(true),
    tutorId: z.string().min(1, "Tutor ID is required when tutor exists."),
    tutor: z.undefined().optional(),
  }),
  z.object({
    isTutorInSystem: z.literal(false),
    tutorId: z.undefined().optional(),
    tutor: BaseTutorSchema,
  }),
  z.object({
    isTutorInSystem: z.undefined().optional(),
    tutorId: z.undefined().optional(),
    tutor: z.undefined().optional(),
  }),
]);

export type TutorQuickInput = z.infer<typeof TutorQuickInputSchema>;

/**
 * Discriminated union schema for quick student enrollment with integrated optional tutor creation.
 */
export const EnrollmentQuickCreateSchema = z.intersection(
  TutorQuickInputSchema,
  z.discriminatedUnion("isInSystem", [
    // Case A: Existing student in database
    BaseEnrollmentSchemaWithoutStudent.extend({
      isInSystem: z.literal(true),
      studentId: z
        .string()
        .min(1, "Student ID is required when student exists."),
      student: z.preprocess((_) => undefined, z.undefined().optional()),
    }),

    // Case B: New student to enroll
    BaseEnrollmentSchemaWithoutStudent.extend({
      isInSystem: z.literal(false),
      studentId: z.preprocess((_) => undefined, z.undefined().optional()),
      student: BaseStudentSchema,
    }),
  ]),
);

export type EnrollmentQuickCreate = z.infer<typeof EnrollmentQuickCreateSchema>;
