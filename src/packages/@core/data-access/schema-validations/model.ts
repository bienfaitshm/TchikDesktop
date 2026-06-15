import { z } from "zod";
import {
  SECTION_ENUM,
  USER_GENDER_ENUM,
  USER_ROLE_ENUM,
  STUDENT_STATUS_ENUM,
  ENROLLMENT_ACTION_ENUM,
} from "@/packages/@core/data-access/db/enum";
import { createZodEnum } from "./utils";

export const ZSECTION_ENUM = createZodEnum(SECTION_ENUM);
export const ZUSER_GENDER_ENUM = createZodEnum(USER_GENDER_ENUM);
export const ZUSER_ROLE_ENUM = createZodEnum(USER_ROLE_ENUM);
export const ZSTUDENT_STATUS_ENUM = createZodEnum(STUDENT_STATUS_ENUM);
export const ZENROLLMENT_ACTION_ENUM = createZodEnum(ENROLLMENT_ACTION_ENUM);

const timestampFields = {
  createdAt: z.coerce.date().describe("Date de création système"),
  updatedAt: z.coerce.date().describe("Date de dernière mise à jour"),
};

export const SchoolSchema = z.object({
  schoolId: z.string().describe("Identifiant unique de l'école (UUID)"),
  name: z.string().min(3).max(255).describe("Nom complet de l'école"),
  address: z.string().max(255).describe("Adresse physique de l'école"), // Corrigé : address (deux 'd')
  town: z.string().max(100).describe("Ville où se situe l'école"),
  logo: z.string().nullable().optional().describe("URL ou chemin du logo"),
  ...timestampFields,
});

export type School = z.infer<typeof SchoolSchema>;

export const UserSchema = z.object({
  userId: z.string().describe("Identifiant unique de l'utilisateur"),
  lastName: z.string().min(2).max(100).describe("Nom de famille"),
  middleName: z.string().min(2).max(100).describe("Post-nom"),
  firstName: z.string().max(100).nullable().optional().describe("Prénom"),
  username: z.string().min(4).max(50).describe("Nom d'utilisateur unique"),
  password: z.string().min(6).max(255).describe("Mot de passe (hashé)"),
  gender: ZUSER_GENDER_ENUM.describe("Sexe de l'utilisateur"),
  role: ZUSER_ROLE_ENUM.describe("Rôle au sein de l'établissement"),
  birthDate: z.coerce
    .date()
    .nullable()
    .optional()
    .describe("Date de naissance"),
  birthPlace: z
    .string()
    .max(100)
    .nullable()
    .optional()
    .describe("Lieu de naissance"),
  schoolId: z.string().describe("Clé étrangère vers l'école"),
  ...timestampFields,
});

export type User = z.infer<typeof UserSchema>;

export const OptionSchema = z.object({
  optionId: z.string().describe("Identifiant unique de l'option"),
  optionName: z.string().min(3).max(100).describe("Nom complet de l'option"),
  optionShortName: z.string().min(1).max(10).describe("Nom abrégé (sigle)"),
  section: ZSECTION_ENUM.describe("Section à laquelle appartient l'option"),
  schoolId: z.string().describe("Clé étrangère vers l'école"),
});

export type Option = z.infer<typeof OptionSchema>;

export const StudyYearSchema = z.object({
  yearId: z.string().describe("Identifiant unique de l'année d'étude"),
  yearName: z
    .string()
    .min(4)
    .max(50)
    .describe("Nom de l'année (ex: 2024-2025)"),
  startDate: z.coerce.date().describe("Date de début de l'année scolaire"),
  endDate: z.coerce.date().describe("Date de fin de l'année scolaire"),
  schoolId: z.string().describe("Clé étrangère vers l'école"),
  ...timestampFields,
});

export type StudyYear = z.infer<typeof StudyYearSchema>;

export const ClassroomSchema = z.object({
  classId: z.string().describe("Identifiant unique de la classe"),
  identifier: z
    .string()
    .min(1)
    .max(50)
    .describe("Identifiant complet (ex: 7ème Scientifique)"),
  shortIdentifier: z
    .string()
    .min(1)
    .max(10)
    .describe("Identifiant court (ex: 7ème S)"),
  section: ZSECTION_ENUM.describe("Section de la classe"),
  yearId: z.string().describe("Clé étrangère vers l'année d'étude"),
  optionId: z
    .string()
    .nullable()
    .optional()
    .describe("Clé étrangère vers l'option"),
  schoolId: z.string().describe("Clé étrangère vers l'école"),
  ...timestampFields,
});

export type Classroom = z.infer<typeof ClassroomSchema>;

export const EnrollmentSchema = z.object({
  enrollmentId: z.string().describe("Identifiant unique de l'inscription"),
  classroomId: z.string().nonempty().describe("Clé étrangère vers la classe"),
  studentId: z.string().describe("Clé étrangère vers l'étudiant (User)"),
  status: ZSTUDENT_STATUS_ENUM.describe(
    "Statut de l'étudiant dans cette classe",
  ),
  isNewStudent: z.boolean().describe("Indique si c'est un nouvel étudiant"),
  studentCode: z
    .string()
    .max(50)
    .describe("Code ou matricule de l'inscription"),
  schoolId: z.string().describe("Clé étrangère vers l'école"),
  yearId: z.string().describe("Clé étrangère vers l'année d'étude"),
  ...timestampFields,
});

export type Enrollment = z.infer<typeof EnrollmentSchema>;

export const EnrollmentActionSchema = z.object({
  actionId: z.string().describe("Identifiant unique de l'action d'audit"),
  enrollmentId: z
    .string()
    .describe("Clé étrangère vers l'inscription concernée"),
  action: ZENROLLMENT_ACTION_ENUM.describe("Type d'action effectuée"),
  reason: z
    .string()
    .max(500)
    .nullable()
    .optional()
    .describe("Raison du changement"),
  ...timestampFields,
});

export type EnrollmentAction = z.infer<typeof EnrollmentActionSchema>;

export const LocalroomSchema = z.object({
  localroomId: z.string().describe("Identifiant unique de la salle"),
  name: z.string().min(1).max(100).describe("Nom ou numéro de la salle"),
  maxCapacity: z
    .number()
    .int()
    .nonnegative()
    .describe("Capacité maximale d'accueil"),
  totalRows: z.number().int().nonnegative().describe("Nombre total de rangées"),
  totalColumns: z
    .number()
    .int()
    .nonnegative()
    .describe("Nombre total de colonnes"),
  schoolId: z.string().describe("Clé étrangère vers l'école"),
});

export type Localroom = z.infer<typeof LocalroomSchema>;

export const SeatingSessionSchema = z.object({
  sessionId: z
    .string()
    .describe("Identifiant unique de la session de placement"),
  sessionName: z
    .string()
    .min(3)
    .max(255)
    .describe("Nom de la session (ex: Examen Premier Semestre)"),
  schoolId: z.string().describe("Clé étrangère vers l'école"),
  yearId: z.string().describe("Clé étrangère vers l'année d'étude"),
});

export type SeatingSession = z.infer<typeof SeatingSessionSchema> & {
  hasAssignments?: boolean;
};

export const SeatingAssignmentSchema = z.object({
  assignmentId: z
    .string()
    .describe("Identifiant unique du placement d'un élève"),
  sessionId: z.string().describe("Clé étrangère vers la session de placement"),
  localroomId: z.string().describe("Clé étrangère vers la salle de classe"),
  enrollmentId: z
    .string()
    .describe("Clé étrangère vers l'inscription de l'élève"),
  rowPosition: z
    .number()
    .int()
    .nonnegative()
    .describe("Index de la rangée attribuée"),
  columnPosition: z
    .number()
    .int()
    .nonnegative()
    .describe("Index de la colonne attribuée"),
});

export type SeatingAssignment = z.infer<typeof SeatingAssignmentSchema>;

export const SchoolCreateSchema = SchoolSchema.omit({
  schoolId: true,
  createdAt: true,
  updatedAt: true,
});
export const SchoolUpdateSchema = SchoolCreateSchema.partial();
export const UserCreateSchema = UserSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(6).max(255),
});
export const UserUpdateSchema = UserCreateSchema.partial();

export const OptionCreateSchema = OptionSchema.omit({ optionId: true });
export const OptionUpdateSchema = OptionCreateSchema.partial();

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
export const ClassroomUpdateSchema = ClassroomCreateSchema.partial();

export const EnrollmentCreateSchema = EnrollmentSchema.omit({
  enrollmentId: true,
  studentCode: true,
  createdAt: true,
  updatedAt: true,
});
export const EnrollmentUpdateSchema = EnrollmentCreateSchema.omit({
  studentId: true,
  classroomId: true,
}).partial();

export const EnrollmentActionCreateSchema = EnrollmentActionSchema.omit({
  actionId: true,
  createdAt: true,
  updatedAt: true,
});

export const LocalroomCreateSchema = LocalroomSchema.omit({
  localroomId: true,
});
export const LocalroomUpdateSchema = LocalroomCreateSchema.partial();

export const SeatingSessionCreateSchema = SeatingSessionSchema.omit({
  sessionId: true,
});
export const SeatingSessionUpdateSchema = SeatingSessionCreateSchema.partial();

export const SeatingAssignmentCreateSchema = SeatingAssignmentSchema.omit({
  assignmentId: true,
});
export const SeatingAssignmentUpdateSchema =
  SeatingAssignmentCreateSchema.partial();

// Ton Student de base
const BaseStudentSchema = UserCreateSchema.omit({
  password: true,
  username: true,
  schoolId: true,
  role: true,
});

const BaseEnrollmentSchemaWithoutStudent = EnrollmentCreateSchema.omit({
  studentId: true,
});

export const EnrollmentQuickCreateSchema = z.discriminatedUnion("isInSystem", [
  // Cas A : L'élève existe déjà
  BaseEnrollmentSchemaWithoutStudent.extend({
    isInSystem: z.preprocess((val) => String(val) === "true", z.literal(true)),
    studentId: z.string({
      required_error:
        "L'identifiant `studentId` est obligatoire lorsque l'élève existe.",
    }),
    student: z.preprocess((_) => undefined, z.undefined().optional()),
  }),

  // Cas B : Nouvel élève
  BaseEnrollmentSchemaWithoutStudent.extend({
    isInSystem: z.preprocess((val) => String(val) === "true", z.literal(false)),
    studentId: z.preprocess(() => undefined, z.undefined().optional()),
    student: BaseStudentSchema,
  }),
]);

export type EnrollmentQuickCreate = z.infer<typeof EnrollmentQuickCreateSchema>;

/**
 * Schéma pour valider le remplissage ou la mise à jour d'une ou plusieurs salles.
 * Intègre un algorithme de détection de collisions de sièges au niveau applicatif.
 */
export const BulkSeatingAssignmentSchema = z
  .object({
    sessionId: z.string().describe("ID de la session active"),
    assignments: z
      .array(SeatingAssignmentCreateSchema)
      .min(1)
      .describe("Liste des assignations à insérer"),
  })
  .superRefine((data, ctx) => {
    const occupiedSeatsByRoom = new Map<string, Set<string>>();

    data.assignments.forEach((assignment, index) => {
      const roomKey = assignment.localroomId;
      const seatCoordinates = `${assignment.rowPosition}-${assignment.columnPosition}`;

      if (!occupiedSeatsByRoom.has(roomKey)) {
        occupiedSeatsByRoom.set(roomKey, new Set());
      }

      const roomSeats = occupiedSeatsByRoom.get(roomKey)!;

      if (roomSeats.has(seatCoordinates)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Conflit de placement : La place [Rangée ${assignment.rowPosition}, Colonne ${assignment.columnPosition}] est déjà attribuée dans cette salle.`,
          path: ["assignments", index],
        });
      } else {
        roomSeats.add(seatCoordinates);
      }
    });
  });

export type BulkSeatingAssignment = z.infer<typeof BulkSeatingAssignmentSchema>;

const getKeys = <T extends z.ZodRawShape>(shape: T) => {
  return Object.keys(shape) as [keyof T & string, ...(keyof T & string)[]];
};

/**
 * Générateur d'options de requêtes complexes et typées dynamiquement pour le Pattern Repository.
 */
export const withQueryOptions = <T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>,
) => {
  const keys = getKeys(dataSchema.shape);

  const SortStepSchema = z.object({
    column: z
      .enum(keys)
      .describe("Nom de la colonne sur laquelle appliquer le tri"),
    order: z.enum(["asc", "desc"]).default("asc"),
  });

  return z
    .object({
      where: dataSchema.partial().optional(),
      whereIn: z.record(z.enum(keys), z.array(z.any())).optional(),
      search: z.record(z.enum(keys), z.string()).optional(),
      or: z.array(dataSchema.partial()).optional(),
      limit: z.coerce
        .number()
        .int()
        .positive()
        .max(500)
        .default(100)
        .optional(),
      offset: z.coerce.number().int().nonnegative().default(0).optional(),
      orderBy: z.array(SortStepSchema).optional(),
    })
    .describe("Options d'interrogations génériques normalisées.");
};
