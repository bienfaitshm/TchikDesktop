import { z } from "zod";

/**
 * Crée un schéma ZodEnum fortement typé à partir d'un Enum TypeScript ou d'un objet "as const".
 * Compatible Zod v4 & TypeScript strict (preserves string literal unions).
 */
export function createZodEnum<T extends Record<string, string>>(enumObj: T) {
  const values = Object.values(enumObj) as [T[keyof T], ...T[keyof T][]];
  return z.enum(values);
}
