import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  seatingSessionRepository,
  classroomRepository,
  localRoomRepository,
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
  ILocalRoomFormParams,
} from "./field-factories.types";
import { mapFiltersToSelectOptions } from "./utils";
import type { SelectOption } from "@/packages/dynamic-form/type";

type FileTypeFieldConfig = Readonly<Partial<FormFieldDef>>;

interface AppFileFilter {
  extensions: string[];
  name: string;
}

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

/**
 * Utilitaire pour extraire proprement les IDs sous forme de tableau de chaînes
 */
const normalizeToArray = (value: unknown): string[] => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
};

/**
 * Gère dynamiquement le type de defaultValue selon la propriété 'multiple'
 */
const determineDefaultValue = (
  providedId: unknown,
  options: readonly SelectOption[],
  multiple?: boolean,
): FormFieldDef["defaultValue"] => {
  const normalized = normalizeToArray(providedId);
  const fallback = options[0]?.value ? [options[0].value] : [];
  const baseValues = normalized.length > 0 ? normalized : fallback;

  if (multiple) {
    return baseValues;
  }

  return baseValues[0];
};

export const createSectionField = async (
  config?: Partial<Readonly<FormFieldDef>>,
) => {
  return SectionFieldFactory.create(config);
};

export const createFileTypeField = async (
  fileFilters: readonly AppFileFilter[],
  overrides?: FileTypeFieldConfig,
): Promise<FormFieldDef> => {
  const options = mapFiltersToSelectOptions(fileFilters);
  const defaultValue = determineDefaultValue(
    overrides?.defaultValue,
    options,
    overrides?.multiple,
  );

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

    const sessions = await seatingSessionRepository.findMany({
      where: { schoolId, yearId },
    });

    const options = DataMappers.sessionsToOptions(sessions);
    const defaultValue = determineDefaultValue(
      sessionId,
      options,
      config.multiple,
    );

    return SeatingSessionFieldFactory.create({
      options,
      defaultValue,
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

    const classrooms = await classroomRepository.findMany({
      where: { schoolId, yearId },
    });

    const options = DataMappers.classroomsToOptions(classrooms);
    const defaultValue = determineDefaultValue(
      classId,
      options,
      config.multiple,
    );

    return ClassroomFieldFactory.create({
      options,
      defaultValue,
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

export const createLocalroomField = async (
  params: Readonly<ILocalRoomFormParams & FileTypeFieldConfig>,
): Promise<FormFieldDef> => {
  try {
    const { schoolId, ...config } = params;

    const localrooms = await localRoomRepository.findMany({
      where: { schoolId },
    });

    const options = DataMappers.localroomsToOptions(localrooms);
    const defaultValue = determineDefaultValue(
      config.defaultValue,
      options,
      config.multiple,
    );

    return LocalRoomsFieldFactory.create({
      options,
      defaultValue,
      colSpan: 4,
      ...config,
    });
  } catch (error) {
    if (error instanceof FieldCreationError) throw error;

    throw new FieldCreationError(
      "FETCH_ERROR",
      "localroom",
      error instanceof Error ? error.message : undefined,
    );
  }
};

export const composeFields = async (
  ...fieldCreators: readonly (Promise<FormFieldDef> | FormFieldDef)[]
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
