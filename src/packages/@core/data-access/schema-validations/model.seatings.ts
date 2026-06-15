import { z } from "zod";

/**
 * Attributs complets d'un Local / Salle de classe.
 */
export const LocalroomSchema = z.object({
  localroomId: z.string().describe("ID unique du local (UUID)"),
  name: z.string().min(1).max(100).describe("Nom de la salle (ex: Salle 101)"),
  maxCapacity: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Capacité maximale d'accueil"),
  totalRows: z.coerce.number().int().min(1).describe("Nombre total de rangées"),
  totalColumns: z.coerce
    .number()
    .int()
    .min(1)
    .describe("Nombre total de colonnes"),
  schoolId: z.string().describe("Référence à l'école (Multi-Tenant)"),
});

export type Localroom = z.infer<typeof LocalroomSchema>;

/**
 * Attributs d'une Session de placement d'examens.
 */
export const SeatingSessionSchema = z.object({
  sessionId: z.string().describe("ID unique de la session (UUID)"),
  sessionName: z
    .string()
    .min(3)
    .max(255)
    .describe("Nom de la session (ex: Examens Session Juin)"),
  schoolId: z.string().describe("Référence à l'école"),
  yearId: z.string().describe("Référence à l'année d'étude"),
});

export type SeatingSession = z.infer<typeof SeatingSessionSchema>;

/**
 * Attributs d'une assignation de place précise (unitaire).
 */
export const SeatingAssignmentSchema = z.object({
  assignmentId: z.string().describe("ID unique de l'assignation (UUID)"),
  sessionId: z.string().describe("Session de placement concernée"),
  localroomId: z.string().describe("Salle concernée"),
  enrollmentId: z.string().describe("Inscription de l'élève"),
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

export type SeatingAssignment = z.infer<typeof SeatingAssignmentSchema>;

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

/**
 * Mise à jour de la place : restriction stricte aux coordonnées physiques.
 * Empêche de modifier la session ou l'élève inscrit après création.
 */
export const SeatingAssignmentUpdateSchema = SeatingAssignmentCreateSchema.omit(
  {
    sessionId: true,
    enrollmentId: true,
  },
).partial();

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
