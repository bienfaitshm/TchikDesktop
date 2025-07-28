import { z } from "zod";

// =====================
// SCHEMAS ZOD
// =====================

export const RoleSchema = z.object({
  id_role: z.number().int().positive().optional(),
  nom_role: z
    .string()
    .min(1, "Le nom du rôle ne peut pas être vide.")
    .max(255, "Le nom du rôle est trop long.")
    .trim(),
});

export const UserSchema = z.object({
  id_utilisateur: z.number().int().positive().optional(),
  nom: z
    .string()
    .min(1, "Le nom ne peut pas être vide.")
    .max(255, "Le nom est trop long.")
    .trim(),
  postnom: z
    .string()
    .max(255, "Le post-nom est trop long.")
    .trim()
    .optional()
    .nullable(),
  prenom: z
    .string()
    .max(255, "Le prénom est trop long.")
    .trim()
    .optional()
    .nullable(),
  email: z
    .string()
    .email("L'adresse email n'est pas valide.")
    .max(255, "L'email est trop long.")
    .trim()
    .optional(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(255, "Le mot de passe est trop long."),
  date_naissance: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "La date de naissance doit être au format AAAA-MM-JJ."
    )
    .optional()
    .nullable(),
  sexe: z
    .string()
    .max(50, "Le sexe est trop long.")
    .trim()
    .optional()
    .nullable(),
});

export const SectionSchema = z.object({
  id_section: z.number().int().positive().optional(),
  nom_section: z
    .string()
    .min(1, "Le nom de la section ne peut pas être vide.")
    .max(255, "Le nom de la section est trop long.")
    .trim(),
});

export const OptionSchema = z.object({
  id_option: z.number().int().positive().optional(),
  nom_option: z
    .string()
    .min(1, "Le nom de l'option ne peut pas être vide.")
    .max(255, "Le nom de l'option est trop long.")
    .trim(),
});

export const AnneeEtudeSchema = z.object({
  id_annee: z.number().int().positive().optional(),
  nom_annee: z
    .string()
    .min(1, "Le nom de l'année d'étude ne peut pas être vide.")
    .max(255, "Le nom de l'année d'étude est trop long.")
    .trim(),
});

export const ClasseSchema = z.object({
  id_classe: z.number().int().positive().optional(),
  nom_identifiant: z
    .string()
    .min(1, "Le nom identifiant de la classe ne peut pas être vide.")
    .max(255, "Le nom identifiant est trop long.")
    .trim(),
  annee_scolaire: z
    .string()
    .min(1, "L'année scolaire ne peut pas être vide.")
    .max(255, "L'année scolaire est trop longue.")
    .trim(),
  id_section: z.number().int().positive().optional().nullable(),
  id_option: z.number().int().positive().optional().nullable(),
  id_annee: z.number().int().positive().optional().nullable(),
});

export const InscriptionSchema = z.object({
  id_inscription: z.number().int().positive().optional(),
  date_inscription: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "La date d'inscription doit être au format AAAA-MM-JJ."
    )
    .optional(),
  id_utilisateur_eleve: z.number().int().positive(),
  id_classe: z.number().int().positive(),
});

export const ProfesseurClasseSchema = z.object({
  id_affectation: z.number().int().positive().optional(),
  matiere_enseignee: z
    .string()
    .max(255, "La matière enseignée est trop longue.")
    .trim()
    .optional()
    .nullable(),
  id_utilisateur_prof: z.number().int().positive(),
  id_classe: z.number().int().positive(),
});

export const RelationParentEleveSchema = z.object({
  id_relation: z.number().int().positive().optional(),
  type_relation: z
    .string()
    .min(1, "Le type de relation ne peut pas être vide.")
    .max(255, "Le type de relation est trop long.")
    .trim(),
  id_utilisateur_parent: z.number().int().positive(),
  id_utilisateur_eleve: z.number().int().positive(),
});

// =====================
// TYPES DÉDUITS
// =====================

/**
 * Type TypeScript pour les attributs d'un Rôle, déduit de RoleSchema.
 */
export type RoleInput = z.infer<typeof RoleSchema>;

/**
 * Type TypeScript pour les attributs d'un Utilisateur, déduit de UserSchema.
 */
export type UserInput = z.infer<typeof UserSchema>;

/**
 * Type TypeScript pour les attributs d'une Section, déduit de SectionSchema.
 */
export type SectionInput = z.infer<typeof SectionSchema>;

/**
 * Type TypeScript pour les attributs d'une Option, déduit de OptionSchema.
 */
export type OptionInput = z.infer<typeof OptionSchema>;

/**
 * Type TypeScript pour les attributs d'une Année d'Étude, déduit de AnneeEtudeSchema.
 */
export type AnneeEtudeInput = z.infer<typeof AnneeEtudeSchema>;

/**
 * Type TypeScript pour les attributs d'une Classe, déduit de ClasseSchema.
 */
export type ClasseInput = z.infer<typeof ClasseSchema>;

/**
 * Type TypeScript pour les attributs d'une Inscription, déduit de InscriptionSchema.
 */
export type InscriptionInput = z.infer<typeof InscriptionSchema>;

/**
 * Type TypeScript pour les attributs d'une Affectation Professeur-Classe, déduit de ProfesseurClasseSchema.
 */
export type ProfesseurClasseInput = z.infer<typeof ProfesseurClasseSchema>;

/**
 * Type TypeScript pour les attributs d'une Relation Parent-Élève, déduit de RelationParentEleveSchema.
 */
export type RelationParentEleveInput = z.infer<
  typeof RelationParentEleveSchema
>;
