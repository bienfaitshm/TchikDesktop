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

export const SchoolSchema = z
  .object({
    schoolId: z
      .string()
      .min(1)
      .describe("Identifiant unique de l'école (UUID)"),
    name: z
      .string()
      .min(2, "Le nom doit avoir au moins 2 caractères.")
      .max(255)
      .describe("Nom complet de l'école"),
    address: z
      .string()
      .min(3, "L'adresse est requise.")
      .max(255)
      .describe("Adresse physique de l'école"),
    town: z
      .string()
      .min(2, "La ville est requise.")
      .max(100)
      .describe("Ville où se situe l'école"),
    logo: optionalNullableString.describe("URL ou chemin du logo"),
  })
  .extend(timestampBaseSchema.shape);

export type School = z.infer<typeof SchoolSchema>;

export const UserSchema = z
  .object({
    userId: z.string().min(1).describe("Identifiant unique de l'utilisateur"),
    lastName: z
      .string()
      .min(2, "Le nom est requis.")
      .max(100)
      .describe("Nom de famille"),
    middleName: z
      .string()
      .min(2, "Le post-nom est requis.")
      .max(100)
      .describe("Post-nom"),
    firstName: optionalNullableString.describe("Prénom"),
    username: z
      .string()
      .min(3, "Le nom d'utilisateur est requis.")
      .max(50)
      .describe("Nom d'utilisateur unique"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir 6 caractères min.")
      .max(255)
      .describe("Mot de passe"),
    gender: ZUSER_GENDER_ENUM.describe("Sexe de l'utilisateur"),
    role: ZUSER_ROLE_ENUM.describe("Rôle au sein de l'établissement"),
    birthDate: z.iso
      .datetime()
      .nullable()
      .optional()
      .describe("Date de naissance (Format ISO)"),
    birthPlace: optionalNullableString.describe("Lieu de naissance"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type User = z.infer<typeof UserSchema>;

export const OptionSchema = z
  .object({
    optionId: z.string().min(1).describe("Identifiant unique de l'option"),
    optionName: z
      .string()
      .min(2, "Le nom est requis.")
      .max(100)
      .describe("Nom complet de l'option"),
    optionShortName: z
      .string()
      .min(1, "Le sigle est requis.")
      .max(10)
      .describe("Nom abrégé (sigle)"),
    section: ZSECTION_ENUM.describe("Section à laquelle appartient l'option"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type Option = z.infer<typeof OptionSchema>;

export const StudyYearSchema = z
  .object({
    yearId: z.string().min(1).describe("Identifiant unique de l'année d'étude"),
    yearName: z
      .string()
      .min(4, "Ex: 2025-2026")
      .max(50)
      .describe("Nom de l'année"),
    startDate: z.iso
      .datetime()
      .nullable()
      .optional()
      .describe("Date de début (ISO)"),
    endDate: z.iso
      .datetime()
      .nullable()
      .optional()
      .describe("Date de fin (ISO)"),
  })
  .extend(timestampBaseSchema.shape);

export type StudyYear = z.infer<typeof StudyYearSchema>;

export const ClassroomSchema = z
  .object({
    classId: z.string().min(1).describe("Identifiant unique de la classe"),
    identifier: z
      .string()
      .min(1, "L'identifiant est requis.")
      .max(50)
      .describe("Identifiant complet"),
    shortIdentifier: z
      .string()
      .min(1, "L'identifiant court est requis.")
      .max(10)
      .describe("Identifiant court"),
    section: ZSECTION_ENUM.describe("Section de la classe"),
    optionId: optionalNullableString.describe("Option rattachée"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type Classroom = z.infer<typeof ClassroomSchema>;

export const EnrollmentSchema = z
  .object({
    enrollmentId: z
      .string()
      .min(1)
      .describe("Identifiant unique de l'inscription"),
    classroomId: z
      .string()
      .min(1, "La classe est requise.")
      .describe("Classe rattachée"),
    studentId: z
      .string()
      .min(1, "L'étudiant est requis.")
      .describe("Éléve rattaché"),
    status: ZSTUDENT_STATUS_ENUM.describe("Statut de l'étudiant"),
    isNewStudent: z
      .boolean()
      .default(false)
      .describe("Indique si c'est un nouvel étudiant"),
    studentCode: z.string().max(50).describe("Code ou matricule d'inscription"),
  })
  .extend(schoolYearIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type Enrollment = z.infer<typeof EnrollmentSchema>;

export const EnrollmentActionSchema = z
  .object({
    actionId: z
      .string()
      .min(1)
      .describe("Identifiant unique de l'action d'audit"),
    enrollmentId: z
      .string()
      .min(1, "L'inscription est requise.")
      .describe("Inscription concernée"),
    action: ZENROLLMENT_ACTION_ENUM.describe("Type d'action effectuée"),
    reason: optionalNullableString.describe("Raison de l'action"),
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
export const SchoolUpdateSchema = SchoolCreateSchema.partial();

export const UserCreateSchema = UserSchema.omit({
  userId: true,
  username: true,
  createdAt: true,
  updatedAt: true,
});
export const UserUpdateSchema = UserCreateSchema.omit({
  schoolId: true,
}).partial();

export const OptionCreateSchema = OptionSchema.omit({
  optionId: true,
  createdAt: true,
  updatedAt: true,
});
export const OptionUpdateSchema = OptionCreateSchema.omit({
  schoolId: true,
}).partial();

export const StudyYearCreateSchema = StudyYearSchema.omit({
  yearId: true,
  createdAt: true,
  updatedAt: true,
});
export const StudyYearUpdateSchema = StudyYearCreateSchema.partial();

export const ClassroomCreateSchema = ClassroomSchema.omit({
  classId: true,
  createdAt: true,
  updatedAt: true,
});
export const ClassroomUpdateSchema = ClassroomCreateSchema.omit({
  schoolId: true,
}).partial();

export const EnrollmentCreateSchema = EnrollmentSchema.omit({
  enrollmentId: true,
  studentCode: true,
  createdAt: true,
  updatedAt: true,
});
export const EnrollmentUpdateSchema = EnrollmentCreateSchema.omit({
  schoolId: true,
  yearId: true,
  studentId: true,
}).partial();

export const EnrollmentActionCreateSchema = EnrollmentActionSchema.omit({
  actionId: true,
  createdAt: true,
  updatedAt: true,
});

/* =========================================================================
   QUICK ENROLLMENT & BULK SEATING
   ========================================================================= */

export const BaseStudentSchema = UserCreateSchema.omit({
  schoolId: true,
  role: true,
});
export type BaseStudent = z.infer<typeof BaseStudentSchema>;

const BaseEnrollmentSchemaWithoutStudent = EnrollmentCreateSchema.omit({
  studentId: true,
});

export const EnrollmentQuickCreateSchema = z.discriminatedUnion("isInSystem", [
  // Cas A : Élève existant dans la BD
  BaseEnrollmentSchemaWithoutStudent.extend({
    isInSystem: z.literal(true),
    studentId: z
      .string()
      .min(
        1,
        "L'identifiant `studentId` est obligatoire lorsque l'élève existe.",
      ),
    student: z.undefined().optional(),
  }),

  // Cas B : Nouvel élève à inscrire
  BaseEnrollmentSchemaWithoutStudent.extend({
    isInSystem: z.literal(false),
    studentId: z.undefined().optional(),
    student: BaseStudentSchema,
  }),
]);

export type EnrollmentQuickCreate = z.infer<typeof EnrollmentQuickCreateSchema>;
