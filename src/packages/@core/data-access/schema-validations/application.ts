import z from "zod";
import { schoolYearIdBaseSchema } from "./model.base";

export const SearchEngineParamsSchema = z
  .object({
    search: z.string().nonempty(),
    limit: z.coerce.number().optional(),
  })
  .extend(schoolYearIdBaseSchema.shape);

export type SearchEngineParams = z.infer<typeof SearchEngineParamsSchema>;
