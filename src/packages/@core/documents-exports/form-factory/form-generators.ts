import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  seatingSessionService,
  classroomService,
} from "@/packages/@core/data-access/db/queries";
import {
  SeatingSessionFieldFactory,
  ClassroomFieldFactory,
  FileTypeFieldFactory,
  LocalRoomsFieldFactory,
  SectionFieldFactory,
} from "./field-factories";
import { DataMappers } from "./data-mappers";
import type {
  IClassroomFormParams,
  ISeatingSessionFormParams,
} from "./field-factories.types";
import { mapFiltersToSelectOptions } from "./utils";

type FileTypeFieldConfig = Readonly<Partial<FormFieldDef>>;

interface FieldFactoryError extends Error {
  code: "FETCH_ERROR" | "MAPPING_ERROR" | "VALIDATION_ERROR";
  entity: string;
}

class FieldCreationError extends Error implements FieldFactoryError {
  constructor(
    public readonly code: FieldFactoryError["code"],
    public readonly entity: string,
    message?: string,
  ) {
    super(message ?? `Failed to create ${entity} field: ${code}`);
    this.name = "FieldCreationError";
  }
}

const ensureStringArray = (
  value: string | readonly string[] | undefined,
): readonly string[] => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value as string];
};

export const createSectionField = async (
  config?: Partial<Readonly<FormFieldDef>>,
) => {
  return SectionFieldFactory.create(config);
};

export const createFileTypeField = async (
  fileFilters: readonly Electron.FileFilter[],
  overrides?: FileTypeFieldConfig,
): Promise<FormFieldDef> => {
  const options = mapFiltersToSelectOptions(fileFilters);
  const defaultValue = options[0]?.value ?? "";

  return FileTypeFieldFactory.create({
    options,
    defaultValue,
    ...overrides,
  });
};

export const createSessionField = async (
  params: Readonly<ISeatingSessionFormParams & FileTypeFieldConfig>,
): Promise<FormFieldDef> => {
  try {
    const { schoolId, yearId, sessionId, ...config } = params;

    const sessions = await seatingSessionService.findMany({
      where: { schoolId, yearId },
    });

    const options = DataMappers.sessionsToOptions(sessions);
    const [defaultSession = options[0]?.value] = ensureStringArray(sessionId);

    return SeatingSessionFieldFactory.create({
      options,
      defaultValue: defaultSession,
      colSpan: 6,
      ...config,
    });
  } catch (error) {
    throw new FieldCreationError(
      "FETCH_ERROR",
      "seatingSession",
      error instanceof Error ? error.message : undefined,
    );
  }
};

export const createClassroomField = async (
  params: Readonly<IClassroomFormParams & FileTypeFieldConfig>,
): Promise<FormFieldDef> => {
  try {
    const { schoolId, yearId, classId, ...config } = params;

    const classrooms = await classroomService.findMany({
      where: { schoolId, yearId },
    });

    if (!classrooms.length) {
      throw new FieldCreationError(
        "VALIDATION_ERROR",
        "classroom",
        "No classrooms found for the given criteria",
      );
    }

    const options = DataMappers.classroomsToOptions(classrooms);

    return ClassroomFieldFactory.create({
      options,
      colSpan: 4,
      ...config,
    });
  } catch (error) {
    if (error instanceof FieldCreationError) throw error;

    throw new FieldCreationError(
      "FETCH_ERROR",
      "classroom",
      error instanceof Error ? error.message : undefined,
    );
  }
};

export const composeFields = async (
  ...fieldCreators: readonly Promise<FormFieldDef>[]
): Promise<readonly FormFieldDef[]> => {
  const results = await Promise.allSettled(fieldCreators);

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason);

  if (errors.length) {
    throw new AggregateError(
      errors,
      `Failed to create ${errors.length} field(s)`,
    );
  }

  return results
    .filter(
      (r): r is PromiseFulfilledResult<FormFieldDef> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);
};
