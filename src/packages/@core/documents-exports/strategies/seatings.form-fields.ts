import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  seatingSessionService,
  localRoomService,
  classroomService,
} from "@/packages/@core/data-access/db/queries";
import { SeatingFormFactory } from "../form-factory";

export type TCreateSeatingFormParams = {
  yearId?: string;
  schoolId?: string;
};

export const SeatingMappers = {
  toSelectOption: (data: any[]) =>
    data.map((item) => ({
      label: item.sessionName || item.name || `${item.shortIdentifier}`,
      value: item.sessionId || item.localRoomId || item.classId,
    })),
};

export async function createSeatingFieldForm({
  schoolId,
  yearId,
}: TCreateSeatingFormParams): Promise<FormFieldDef[]> {
  if (!schoolId || !yearId) return [];

  const [seatings, localRooms, classRooms] = await Promise.all([
    seatingSessionService.findMany({ where: { schoolId, yearId } }),
    localRoomService.findMany({ where: { schoolId } }),
    classroomService.findMany({ where: { schoolId, yearId } }),
  ]);

  return [
    SeatingFormFactory.buildSeatingField(
      SeatingMappers.toSelectOption(seatings),
    ),
    SeatingFormFactory.buildLocalRoomsField(
      SeatingMappers.toSelectOption(localRooms),
    ),
    SeatingFormFactory.buildClassRoomsField(
      SeatingMappers.toSelectOption(classRooms),
    ),
  ];
}
