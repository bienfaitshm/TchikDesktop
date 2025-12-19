import { z, ZodTypeAny, ZodFirstPartyTypeKind } from "zod";

/**
 * Interface descriptive pour un champ : peut être un type simple (string) ou un objet récursif.
 */
export type SchemaDescriptor = string | { [key: string]: SchemaDescriptor };

/**
 * Dictionnaire de correspondance des noms de type Zod vers des noms de type simplifiés.
 * Utilisé pour les types atomiques (primitifs).
 */
const ZOD_TYPE_MAP: { [key: string]: string } = {
  [ZodFirstPartyTypeKind.ZodString]: "string",
  [ZodFirstPartyTypeKind.ZodNumber]: "number",
  [ZodFirstPartyTypeKind.ZodBoolean]: "boolean",
  [ZodFirstPartyTypeKind.ZodDate]: "date",
  [ZodFirstPartyTypeKind.ZodBigInt]: "bigint",
  [ZodFirstPartyTypeKind.ZodLiteral]: "literal",
  [ZodFirstPartyTypeKind.ZodEnum]: "enum",
  [ZodFirstPartyTypeKind.ZodUnknown]: "unknown",
  [ZodFirstPartyTypeKind.ZodAny]: "any",
  [ZodFirstPartyTypeKind.ZodNull]: "null",
  [ZodFirstPartyTypeKind.ZodUndefined]: "undefined",
  [ZodFirstPartyTypeKind.ZodVoid]: "void",
};

/**
 * Extrait le type Zod le plus interne en traversant les wrappers (optional, nullable, default).
 * @param schema Le schéma Zod de départ.
 * @returns Le schéma Zod le plus interne.
 */
function getInnermostSchema(schema: ZodTypeAny): ZodTypeAny {
  let currentSchema = schema;

  while (true) {
    const typeName = currentSchema._def.typeName;

    // Définir la propriété à suivre en fonction du wrapper
    let innerTypeKey: "innerType" | "type" | "schema" | undefined;

    switch (typeName) {
      case ZodFirstPartyTypeKind.ZodOptional:
      case ZodFirstPartyTypeKind.ZodNullable:
      case ZodFirstPartyTypeKind.ZodDefault:
        innerTypeKey = "innerType";
        break;
      case ZodFirstPartyTypeKind.ZodEffects: // Ex: .transform(), .refine()
      case ZodFirstPartyTypeKind.ZodCatch:
        innerTypeKey = "schema";
        break;
      // D'autres wrappers comme ZodBranded, ZodLazy pourraient être ajoutés ici.
      default:
        // Si ce n'est pas un wrapper connu, on a atteint le type de base
        return currentSchema;
    }

    // On utilise l'opérateur 'as any' car les définitions internes de Zod ne sont pas
    // toujours directement accessibles ou cohérentes entre tous les types de wrappers.
    currentSchema = (currentSchema._def as any)[innerTypeKey!];
  }
}

/**
 * Mappe un schéma Zod (objet, tableau, ou type simple) en une structure descriptive.
 * @param schema Le schéma Zod de type z.AnyZodObject, z.ZodArray, ou ZodTypeAny.
 * @returns La description du schéma.
 */
export function mapZodSchemaToDescriptor(schema: ZodTypeAny): SchemaDescriptor {
  const innermostSchema = getInnermostSchema(schema);
  const typeName = innermostSchema._def.typeName;

  // --- 1. Traitement des Objets (Récursif) ---
  if (typeName === ZodFirstPartyTypeKind.ZodObject) {
    const objectSchema = innermostSchema as z.AnyZodObject;
    const shape = objectSchema.shape;
    const descriptor: { [key: string]: SchemaDescriptor } = {};

    for (const key in shape) {
      if (Object.prototype.hasOwnProperty.call(shape, key)) {
        // Appel récursif pour chaque champ de l'objet
        descriptor[key] = mapZodSchemaToDescriptor(shape[key]);
      }
    }
    return descriptor;
  }

  // --- 2. Traitement des Tableaux (Récursif) ---
  if (typeName === ZodFirstPartyTypeKind.ZodArray) {
    const arraySchema = innermostSchema as z.ZodArray<ZodTypeAny>;
    // Récupérer le type des éléments du tableau
    const elementTypeDescriptor = mapZodSchemaToDescriptor(arraySchema.element);

    // Représenter le tableau comme un tableau de son type d'élément
    return `array<${JSON.stringify(elementTypeDescriptor)}>`;
  }

  // --- 3. Traitement des Unions et Discréminées ---
  if (
    typeName === ZodFirstPartyTypeKind.ZodUnion ||
    typeName === ZodFirstPartyTypeKind.ZodDiscriminatedUnion
  ) {
    // Pour les unions, on simplifie en indiquant "union"
    return "union";
  }

  // --- 4. Traitement des Types Atomiques ---
  const simplifiedType = ZOD_TYPE_MAP[typeName];
  if (simplifiedType) {
    return simplifiedType;
  }

  // --- 5. Type inconnu ou non géré ---
  return typeName.replace("Zod", "").toLowerCase();
}
