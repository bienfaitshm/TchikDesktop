import type { FormFieldDef } from "@/packages/dynamic-form";
import { classroomService } from "@/packages/@core/data-access/db/queries";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { EnrollmentFormFactory } from "../form-factory";

export type TCreateEnrollmentsgFormParams = {
  yearId?: string;
  schoolId?: string;
  classId?: string;
};

export const EnrollmentsgMappers = {
  toSelectOption: (data: any[]) =>
    data.map((item) => ({
      label: `${item.shortIdentifier}`,
      value: item.classId,
    })),
};

export async function createEnrollmentsgFieldForm({
  schoolId,
  yearId,
  classId,
}: TCreateEnrollmentsgFormParams & Record<string, unknown>): Promise<
  FormFieldDef[]
> {
  if (!schoolId || !yearId) return [];

  const classrooms = await classroomService.findMany({
    where: { schoolId, yearId },
  });

  return [
    EnrollmentFormFactory.buildSectionField(
      EnrollmentsgMappers.toSelectOption(SECTION_OPTIONS),
    ),
    EnrollmentFormFactory.buildClassRoomsField(
      EnrollmentsgMappers.toSelectOption(classrooms),
      classId ? [classId] : [],
    ),
  ];
}
