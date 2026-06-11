import type { EnrollmentQuickCreate } from "@/packages/@core/data-access/schema-validations";

export type EnrollmentFormData = EnrollmentQuickCreate;

export type SelectExistStudentProps = {
  yearId?: string;
  schoolId: string;
};
