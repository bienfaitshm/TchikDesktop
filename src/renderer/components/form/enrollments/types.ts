import type { EnrollmentQuickCreate } from "@/packages/@core/data-access/schema-validations";
import type { SearchOption } from "@/renderer/libs/queries/base";

export type EnrollmentFormData = EnrollmentQuickCreate;

export type SelectExistStudentProps = {
  students: SearchOption;
};
