import { z } from "zod";
/* =========================================================================
   SEATING GENERATOR SCHEMA
   ========================================================================= */

/**
 * Schéma de validation pour le générateur de placement (Examens/Salles).
 */
export const SeatingGeneratorSchema = z.object({
  localRoomIds: z
    .array(z.string().min(1, "L'ID du local est invalide."))
    .min(1, "Veuillez sélectionner au moins un local."),

  classRoomIds: z
    .array(z.string().min(1, "L'ID de la classe est invalide."))
    .min(1, "Veuillez sélectionner au moins une classe."),

  confortRatio: z.coerce
    .number({ message: "Le ratio de confort doit être un nombre valide." })
    .min(0, "Le ratio ne peut pas être inférieur à 0%.")
    .max(100, "Le ratio ne peut pas dépasser 100%."),
});

export type SeatingGenerator = z.infer<typeof SeatingGeneratorSchema>;

/* =========================================================================
   SEARCH OPTIONS GENERATOR
   ========================================================================= */

/**
 * Crée un schéma Zod validant la structure SearchOptions de manière dynamique et typée.
 * @param filtersSchema Un schéma Zod optionnel pour valider les filtres spécifiques à une entité.
 */
export function createSearchOptionsSchema<
  T extends z.ZodTypeAny = z.ZodTypeAny,
>(filtersSchema?: T) {
  return z.object({
    search: z.string().trim().optional(),
    filters: filtersSchema ? filtersSchema.optional() : z.unknown().optional(),
  });
}

export type SearchOptions<T extends z.ZodTypeAny = z.ZodTypeAny> = z.infer<
  ReturnType<typeof createSearchOptionsSchema<T>>
>;

/* =========================================================================
   BULK CREATE SCHEMA GENERATOR
   ========================================================================= */

/**
 * Génère un schéma Zod robuste pour la validation de payloads de création par lot (Bulk).
 * Garantit le typage strict du schéma enfant et l'unicité des clés d'identification.
 * @param createSchema Le schéma Zod unitaire à encapsuler (ex: ClassroomCreateSchema)
 */
export function createBulkCreateSchema<T extends z.ZodTypeAny>(
  createSchema: T,
) {
  return z
    .object({
      items: z
        .array(
          z.object({
            key: z
              .string("La clé d'identification est requise.")
              .min(1, "La clé d'identification ne peut pas être vide."),
            value: createSchema,
          }),
        )
        .min(1, "Le tableau doit contenir au moins un élément."),
    })
    .superRefine((data, ctx) => {
      const seenKeys = new Set<string>();

      data.items.forEach((item, index) => {
        if (seenKeys.has(item.key)) {
          ctx.addIssue({
            message: `Clé dupliquée détectée : "${item.key}"`,
            path: ["items", index, "key"],
            code: "custom",
          });
        } else {
          seenKeys.add(item.key);
        }
      });
    });
}

/**
 * Type utilitaire pour déduire le type de création par lot à partir du schéma unitaire.
 */
export type BulkCreatePayload<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createBulkCreateSchema<T>>
>;

/**
 * Zod runtime validation schema for student fee payment tickets.
 * Ensures data integrity for receipt printing and financial record keeping.
 */
export const TicketSchema = z.object({
  paymentId: z.string().nonempty(),
  tickRef: z.string().nonempty(),
});

export type Ticket = z.infer<typeof TicketSchema>;
