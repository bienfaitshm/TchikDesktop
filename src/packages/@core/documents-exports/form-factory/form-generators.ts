import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  classroomService,
  localRoomService,
  seatingSessionService,
  feeTypeService,
} from "@/packages/@core/data-access/db";
import {
  SeatingSessionFieldFactory,
  ClassroomFieldFactory,
  FileTypeFieldFactory,
  LocalRoomsFieldFactory,
  SectionFieldFactory,
  DateInputFieldFactory,
  FeeTypeFieldFactory,
} from "./field-factories";
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
const normalizeToArray = (
  value: (string | number) | (string | number)[],
): string[] => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
};

/**
 * Gère dynamiquement le type de defaultValue selon la propriété 'multiple'
 */
const determineDefaultValue = (
  providedId: (string | number | undefined) | (string | number | undefined)[],
  options: readonly SelectOption[],
  multiple?: boolean,
): FormFieldDef["defaultValue"] => {
  if (!providedId) return undefined;
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

    const sessions = await seatingSessionService.getOptions({
      where: {
        seatingSessions: {
          schoolId,
          yearId,
        },
      },
    });

    const defaultValue = determineDefaultValue(
      sessionId,
      sessions,
      config.multiple,
    );

    return SeatingSessionFieldFactory.create({
      options: sessions,
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
    const { schoolId, classId, ...config } = params;

    const classrooms = await classroomService.getOptions({
      where: { classrooms: { schoolId } },
    });

    const defaultValue = determineDefaultValue(
      classId,
      classrooms,
      config.multiple,
    );

    return ClassroomFieldFactory.create({
      options: classrooms,
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

    const localrooms = await localRoomService.getOptions({
      where: { localrooms: { schoolId } },
    });

    const defaultValue = determineDefaultValue(
      config.defaultValue,
      localrooms,
      config.multiple,
    );

    return LocalRoomsFieldFactory.create({
      options: localrooms,
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

export const createDateInputField = () => {
  return DateInputFieldFactory.create("start", "Debut");
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

export const createFeeTypeField = async (
  params: Readonly<IClassroomFormParams & FileTypeFieldConfig>,
): Promise<FormFieldDef> => {
  try {
    const { schoolId, classId, ...config } = params;

    const feeTypes = await feeTypeService.getOptions({
      where: { feeTypes: { schoolId } },
    });

    const defaultValue = determineDefaultValue(
      classId,
      feeTypes,
      config.multiple,
    );

    return FeeTypeFieldFactory.create({
      options: feeTypes,
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
