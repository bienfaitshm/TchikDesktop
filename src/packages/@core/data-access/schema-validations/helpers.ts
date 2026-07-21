import * as z from "zod";

type InferOperators<T> =
  | T
  | {
      $eq?: T;
      $ne?: T;
      $gt?: T;
      $gte?: T;
      $lt?: T;
      $lte?: T;
      $in?: T[];
      $notIn?: T[];
      $like?: string;
    };

type InferTableFilters<TOutput> = {
  [K in keyof TOutput]?: InferOperators<TOutput[K]>;
};

type ShapesRecord = Record<string, z.ZodTypeAny>;
type TableWhere<TSchema extends z.ZodTypeAny> = InferTableFilters<
  z.output<TSchema>
>;

export type QueryOptionsOutput<TShapes extends ShapesRecord> = {
  where?: Partial<{ [K in keyof TShapes]: TableWhere<TShapes[K]> }>;
  or?: Array<Partial<{ [K in keyof TShapes]: TableWhere<TShapes[K]> }>>;
  orderBy?: Array<
    {
      [K in keyof TShapes]: {
        table: K;
        column: Extract<keyof z.output<TShapes[K]>, string>;
        order?: "asc" | "desc";
      };
    }[keyof TShapes]
  >;
  limit?: number;
  offset?: number;
};

function unwrapOptionalNullable(schema: z.ZodTypeAny): z.core.$ZodType {
  let cur: z.core.$ZodType = schema;

  while (cur instanceof z.ZodOptional || cur instanceof z.ZodNullable) {
    cur = cur.unwrap();
  }

  return cur;
}

export function getUnwrappedObjectShape(schema: z.ZodTypeAny): z.ZodRawShape {
  const cur = unwrapOptionalNullable(schema);
  return cur instanceof z.ZodObject ? cur.shape : {};
}

function isStringLikeSchema(schema: z.ZodTypeAny): boolean {
  const core = unwrapOptionalNullable(schema);
  return core instanceof z.ZodString || core instanceof z.ZodEnum;
}

function createOperatorsSchema(columnSchema: z.ZodTypeAny) {
  const isStringLike = isStringLikeSchema(columnSchema);

  const base = {
    $eq: columnSchema.optional(),
    $ne: columnSchema.optional(),
    $gt: columnSchema.optional(),
    $gte: columnSchema.optional(),
    $lt: columnSchema.optional(),
    $lte: columnSchema.optional(),
    $in: z.array(columnSchema).optional(),
    $notIn: z.array(columnSchema).optional(),
  };

  const operators = z
    .object(isStringLike ? { ...base, $like: z.string().optional() } : base)
    .strict();

  return z.union([columnSchema, operators]);
}

function createTableFilterSchema(tableSchema: z.ZodTypeAny) {
  const shape = getUnwrappedObjectShape(tableSchema);
  const filterShape: Record<string, z.ZodTypeAny> = {};

  for (const key in shape) {
    filterShape[key] = createOperatorsSchema(shape[key]).optional();
  }

  return z.object(filterShape).partial();
}

export function withQueryOptions<TShapes extends ShapesRecord>(
  target: TShapes,
): z.ZodType<QueryOptionsOutput<TShapes>> {
  const paginationShape = {
    limit: z.coerce.number().int().positive().max(500).default(100).optional(),
    offset: z.coerce.number().int().nonnegative().default(0).optional(),
  };

  const whereShape: Record<string, z.ZodTypeAny> = {};
  for (const [tableName, schema] of Object.entries(target)) {
    whereShape[tableName] = createTableFilterSchema(schema).optional();
  }
  const AdvancedFiltersSchema = z.object(whereShape).partial();

  const orderBySchemas = Object.entries(target).map(([tableName, schema]) => {
    const keys = Object.keys(getUnwrappedObjectShape(schema));
    return z.object({
      table: z.literal(tableName),
      column: keys.length ? z.enum(keys as [string, ...string[]]) : z.never(),
      order: z.enum(["asc", "desc"]).default("asc").optional(),
    });
  });

  const SortStepSchema =
    orderBySchemas.length === 0
      ? z.never()
      : orderBySchemas.length === 1
        ? orderBySchemas[0]
        : z.union(
            orderBySchemas as unknown as [
              z.ZodTypeAny,
              z.ZodTypeAny,
              ...z.ZodTypeAny[],
            ],
          );

  return z
    .object({
      where: AdvancedFiltersSchema.optional(),
      or: z.array(AdvancedFiltersSchema).optional(),
      orderBy: z.array(SortStepSchema).optional(),
      ...paginationShape,
    })
    .partial() as unknown as z.ZodType<QueryOptionsOutput<TShapes>>;
}
