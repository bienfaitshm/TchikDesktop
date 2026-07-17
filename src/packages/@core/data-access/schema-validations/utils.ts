import z from "zod";

export function createZodEnum<T extends object>(_enum: T) {
  return z.enum(_enum as any);
}
