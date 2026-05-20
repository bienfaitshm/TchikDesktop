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
    .max(100, "Le ratio ne peut pas dépasser 100%")
    .default(100),
});

export type SeatingGenerator = z.infer<typeof seatingGeneratorSchema>;
