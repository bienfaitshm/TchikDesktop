import z from "zod";

/**
 * Crée un schéma Zod basé sur une énumération native (`nativeEnum`).
 * * Cette fonction utilitaire permet de définir rapidement la validation d'un champ d'énumération
 * en s'assurant que le message d'erreur est personnalisé pour une meilleure UX.
 *
 * @template TEnum Le type de l'énumération native passée en argument.
 * @param _enum L'objet énumération natif (e.g., `SECTION`, `USER_ROLE`).
 * @param message Le message d'erreur personnalisé à utiliser si la validation échoue.
 * @returns Un schéma Zod de type ZodNativeEnum.
 * * @example
 * // Utilisation de l'enum ZodCustomEnum
 * const RoleSchema = createZodEnum(USER_ROLE, "Le rôle fourni n'est pas valide.");
 * // RoleSchema est de type z.ZodNativeEnum<typeof USER_ROLE>
 */
export function createZodEnum<TEnum extends z.EnumLike>(
  _enum: TEnum,
  message?: string,
): z.ZodNativeEnum<TEnum> {
  const defaultMessage = "Valeur d'énumération non valide.";

  return z.nativeEnum(_enum, {
    errorMap: message
      ? () => ({ message })
      : () => ({ message: defaultMessage }),
  });
}
