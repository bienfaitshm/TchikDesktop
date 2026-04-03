import z from "zod";

/** * Attributs complets d'un Local/Salle
 */
export const LocalRoomAttributesSchema = z.object({
  localRoomId: z.string().describe("ID unique du local"),
  name: z.string().min(1).max(100).describe("Nom de la salle (ex: Salle 101)"),
  maxCapacity: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Capacité maximale"),
  totalRows: z.coerce.number().int().min(1).describe("Nombre total de rangées"),
  totalColumns: z.coerce
    .number()
    .int()
    .min(1)
    .describe("Nombre total de colonnes"),
  schoolId: z.string().describe("Référence à l'école"),
});

export const LocalRoomCreateSchema = LocalRoomAttributesSchema.omit({
  localRoomId: true,
});
export const LocalRoomUpdateSchema = LocalRoomCreateSchema.partial();

/** * Attributs d'une Session de placement
 */
export const SeatingSessionAttributesSchema = z.object({
  sessionId: z.string().describe("ID unique de la session"),
  sessionName: z
    .string()
    .min(3)
    .max(255)
    .describe("Nom (ex: Examens Session Juin)"),
  schoolId: z.string().describe("Référence à l'école"),
  yearId: z.string().describe("Référence à l'année d'étude"),
});

export const SeatingSessionCreateSchema = SeatingSessionAttributesSchema.omit({
  sessionId: true,
});
export const SeatingSessionUpdateSchema = SeatingSessionCreateSchema.partial();

/** * Attributs d'une assignation de place précise
 */
export const SeatingAssignmentAttributesSchema = z.object({
  assignmentId: z.string().describe("ID unique de l'assignation"),
  sessionId: z.string().describe("Session concernée"),
  localRoomId: z.string().describe("Salle concernée"),
  enrolementId: z.string().describe("Inscription de l'élève"),
  rowPosition: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Index de la rangée (0-N)"),
  columnPosition: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Index de la colonne (0-N)"),
});

export const SeatingAssignmentCreateSchema =
  SeatingAssignmentAttributesSchema.omit({
    assignmentId: true,
  });

/**
 * Update spécifique : souvent, on ne change que la place,
 * pas la session ni l'élève.
 */
export const SeatingAssignmentUpdateSchema = SeatingAssignmentCreateSchema.omit(
  {
    sessionId: true,
    enrolementId: true,
  },
).partial();

/**
 * Schéma pour valider le remplissage d'une salle entière
 */
export const BulkSeatingAssignmentSchema = z
  .object({
    sessionId: z.string(),
    localRoomId: z.string(),
    assignments: z
      .array(
        z.object({
          enrolementId: z.string(),
          rowPosition: z.number().int().nonnegative(),
          columnPosition: z.number().int().nonnegative(),
        }),
      )
      .min(1),
  })
  .refine(
    (data) => {
      // Optionnel : Validation custom pour vérifier les doublons de positions dans l'array
      const positions = data.assignments.map(
        (a) => `${a.rowPosition}-${a.columnPosition}`,
      );
      return new Set(positions).size === positions.length;
    },
    {
      message: "Doublons de places détectés dans le même local",
      path: ["assignments"],
    },
  );
