import { z } from "zod";

/**
 * Schéma de validation pour le générateur de placement.
 */
export const seatingGeneratorSchema = z.object({
  localRoomIds: z
    .array(z.string().min(1, "L'ID du local est invalide"))
    .min(1, "Veuillez sélectionner au moins un local"),

  classRoomIds: z
    .array(z.string().min(1, "L'ID de la classe est invalide"))
    .min(1, "Veuillez sélectionner au moins une classe"),
  confortRatio: z.coerce
    .number({
      invalid_type_error: "Le ratio de confort doit être un nombre",
      required_error: "Le ratio est requis",
    })
    .min(0, "Le ratio ne peut pas être inférieur à 0%")
    .max(100, "Le ratio ne peut pas dépasser 100%"),
});

export type SeatingGenerator = z.infer<typeof seatingGeneratorSchema>;

/**
 * Crée un schéma Zod validant la structure SearchOptions de manière dynamique et typée.
 * @param filtersSchema Un schéma Zod optionnel pour valider les filtres spécifiques à une entité.
 */
export function createSearchOptionsSchema<
  T extends z.ZodTypeAny = z.ZodUnknown,
>(filtersSchema?: T) {
  return z.object({
    search: z.string().trim().optional(),
    filters: filtersSchema ? filtersSchema.optional() : z.unknown().optional(),
  });
}

/**
 * Génère un schéma Zod robuste pour la validation de payloads de création par lot (Bulk).
 * Garantit le typage strict du schéma enfant et l'unicité des clés d'identification.
 * * @param createSchema Le schéma Zod unitaire à encapsuler (ex: ClassroomCreateSchema)
 */
export function createBulkCreateSchema<T extends z.ZodTypeAny>(
  createSchema: T,
) {
  return z
    .object({
      items: z
        .array(
          z.object({
            key: z.string({
              required_error: "La clé d'identification est requise",
            }),
            value: createSchema,
          }),
        )
        .min(1, "Le tableau doit contenir au moins un élément"),
    })
    .superRefine((data, ctx) => {
      const seenKeys = new Set<string>();

      data.items.forEach((item, index) => {
        if (seenKeys.has(item.key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Clé dupliquée détectée : "${item.key}"`,
            path: ["items", index, "key"],
          });
        }
        seenKeys.add(item.key);
      });
    });
}

/**
 * Type utilitaire pro pour inférer automatiquement la structure du Bulk
 * Exemple d'usage : type ClassroomBulkInput = InferBulkCreate<typeof ClassroomCreateSchema>;
 */
export type InferBulkCreate<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createBulkCreateSchema<T>>
>;
