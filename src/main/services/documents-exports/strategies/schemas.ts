import { z } from "zod";

export const DocumentExportSchema = z.object({
  // schoolId est requis et doit être une chaîne
  schoolId: z.string().min(1, "L'identifiant de l'école est requis."),

  // yearId est optionnel et doit être une chaîne (ou undefined)
  yearId: z.string().optional(),

  // sections accepte soit une chaîne, soit un tableau de chaînes, et est transformé en tableau
  sections: z.union([z.string(), z.array(z.string())]).transform((val) => {
    // Si c'est une chaîne, le transforme en tableau [val].
    // Si c'est déjà un tableau, le retourne tel quel.
    if (Array.isArray(val)) return val;
    return [val];
  }),

  // classrooms accepte soit une chaîne, soit un tableau de chaînes, et est transformé en tableau
  classrooms: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) return val;
    return [val];
  }),
});

export type DocumentExportSchemaAttributes = z.infer<
  typeof DocumentExportSchema
>;
