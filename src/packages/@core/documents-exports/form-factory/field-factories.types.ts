import type { FormFieldDef } from "@/packages/dynamic-form";

/**
 * Base field configuration contract
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
  readonly sessionId?: string | string[];
}

/**
 * Enrollment form specific parameters
 */
export interface IClassroomFormParams extends IFormContext {
  readonly classId?: string | string[];
}

/**
 * Field factory contract
 */
export interface IFieldFactory<TParams = void> {
  buildDefault(): FormFieldDef;
  buildWithConfig(config?: TBaseFieldConfig): FormFieldDef;
  buildFromParams?(params: TParams): Promise<FormFieldDef[]>;
}
