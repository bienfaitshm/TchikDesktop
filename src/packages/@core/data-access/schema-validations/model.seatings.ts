import { z } from "zod";
import {
  schoolIdBaseSchema,
  schoolYearIdBaseSchema,
  timestampBaseSchema,
} from "./model.base";

/* =========================================================================
   LOGISTICS & SEATING SCHEMAS
   ========================================================================= */

export const LocalroomSchema = z
  .object({
    localroomId: z.string().min(1).describe("Identifiant unique de la salle"),
    name: z
      .string()
      .min(1, "Le nom du local est requis.")
      .max(100)
      .describe("Nom de la salle"),
    maxCapacity: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .describe("Capacité maximale"),
    totalRows: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .describe("Nombre total de rangées"),
    totalColumns: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .describe("Nombre total de colonnes"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type Localroom = z.infer<typeof LocalroomSchema>;

export const SeatingSessionSchema = z
  .object({
    sessionId: z.string().min(1).describe("Identifiant unique de la session"),
    sessionName: z
      .string()
      .min(2, "Le nom de la session est requis.")
      .max(255)
      .describe("Nom de la session"),
  })
  .extend(schoolYearIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type SeatingSession = z.infer<typeof SeatingSessionSchema> & {
  hasAssignments?: boolean;
};

export const SeatingAssignmentSchema = z.object({
  assignmentId: z.string().min(1).describe("ID unique du placement"),
  sessionId: z
    .string()
    .min(1, "La session est requise.")
    .describe("Session associée"),
  localroomId: z
    .string()
    .min(1, "La salle est requise.")
    .describe("Salle de classe"),
  enrollmentId: z
    .string()
    .min(1, "L'étudiant est requis.")
    .describe("Inscription concernée"),
  rowPosition: z.coerce
    .number()
    .int()
    .min(1, "Rangée >= 1 requis.")
    .describe("Rangée attribuée"),
  columnPosition: z.coerce
    .number()
    .int()
    .min(1, "Colonne >= 1 requis.")
    .describe("Colonne attribuée"),
});

export type SeatingAssignment = z.infer<typeof SeatingAssignmentSchema>;

export const LocalroomCreateSchema = LocalroomSchema.omit({
  localroomId: true,
  createdAt: true,
  updatedAt: true,
});
export const LocalroomUpdateSchema = LocalroomCreateSchema.omit({
  schoolId: true,
}).partial();

export const SeatingSessionCreateSchema = SeatingSessionSchema.omit({
  sessionId: true,
  createdAt: true,
  updatedAt: true,
});
export const SeatingSessionUpdateSchema = SeatingSessionCreateSchema.omit({
  schoolId: true,
  yearId: true,
}).partial();

export const SeatingAssignmentCreateSchema = SeatingAssignmentSchema.omit({
  assignmentId: true,
});
export const SeatingAssignmentUpdateSchema = SeatingAssignmentCreateSchema.omit(
  { sessionId: true, localroomId: true, enrollmentId: true },
).partial();

export const BulkSeatingAssignmentSchema = z
  .object({
    sessionId: z.string().min(1, "L'ID de la session est requis."),
    assignments: z
      .array(SeatingAssignmentCreateSchema)
      .min(1, "Au moins un placement doit être soumis."),
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
          code: "custom",
          message: `Conflit de placement : La place [Rangée ${assignment.rowPosition}, Colonne ${assignment.columnPosition}] est déjà attribuée dans ce local.`,
          path: ["assignments", index],
        });
      } else {
        roomSeats.add(seatCoordinates);
      }
    });
  });

export type BulkSeatingAssignment = z.infer<typeof BulkSeatingAssignmentSchema>;
