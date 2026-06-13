import type { FormFieldDef } from "@/packages/dynamic-form";

/**
 * Base field configuration contract
 * Excludes core identity properties to prevent accidental overrides during factory composition.
 */
export type TBaseFieldConfig = Partial<Omit<FormFieldDef, "id" | "type">>;

/**
 * Form context required for data fetching
 */
export interface IFormContext {
  readonly schoolId: string;
  readonly yearId: string;
}

/**
 * Seating form specific parameters
 */
export interface ISeatingSessionFormParams extends IFormContext {
  readonly sessionId?: string | readonly string[];
}

/**
 * Enrollment form specific parameters
 */
export interface IClassroomFormParams extends IFormContext {
  readonly classId?: string | readonly string[];
}

/**
 * Local room form specific parameters
 * Extends IFormContext to maintain consistency across repository queries.
 */
export interface ILocalRoomFormParams extends IFormContext {
  readonly roomId?: string | readonly string[];
}

/**
 * Generic Field factory contract representing the lifecycle of a dynamic form field.
 * Allows synchronous static building as well as asynchronous, parameter-driven building.
 */
export interface IFieldFactory<
  TParams = void,
  TConfig extends TBaseFieldConfig = TBaseFieldConfig,
> {
  /**
   * Generates a structural field definition with production-ready defaults.
   */
  buildDefault(): FormFieldDef;

  /**
   * Generates a field definition by merging standard defaults with custom configuration overrides.
   */
  buildWithConfig(config?: TConfig): FormFieldDef;

  /**
   * Asynchronously fetches required database dependencies based on parameters
   * and maps them into a fully contextualized list of form fields.
   */
  buildFromParams?(params: TParams & TConfig): Promise<FormFieldDef>;
}

/**
 * Type utility representing a standard asynchronous field creator function.
 * Used to type-safe the orchestration in orchestrators like `composeFields`.
 */
export type FieldCreatorFn<TParams> = (
  params: TParams & TBaseFieldConfig,
) => Promise<FormFieldDef>;
