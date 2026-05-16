import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  seatingSessionService,
  localRoomService,
} from "@/packages/@core/data-access/db/queries";
import { SeatingFormFactory } from "../form-factory";

export type TCreateSeatingFormParams = {
  yearId?: string;
  schoolId?: string;
  sessionId?: string | string[];
  localRoomId?: string | string[];
};

export const SeatingMappers = {
  toSessionOptions: (
    sessions: Awaited<ReturnType<typeof seatingSessionService.findMany>>,
  ) =>
    sessions.map((session) => ({
      label: session.sessionName,
      value: session.sessionId,
    })),

  toLocalRoomOptions: (
    rooms: Awaited<ReturnType<typeof localRoomService.findMany>>,
  ) =>
    rooms.map((room) => ({
      label: room.name,
      value: room.localRoomId,
    })),
};

/**
 * Génère la configuration des champs de formulaire dynamiques pour les assignations de places.
 * Gère automatiquement l'injection des sélections par défaut (uniques ou multiples).
 */
export async function createSeatingFieldForm({
  schoolId,
  yearId,
  sessionId,
}: TCreateSeatingFormParams): Promise<FormFieldDef[]> {
  if (!schoolId || !yearId) {
    return [];
  }

  const [seatings] = await Promise.all([
    seatingSessionService.findMany({ where: { schoolId, yearId } }),
    // localRoomService.findMany({ where: { schoolId } }),
  ]);

  const defaultSessionValue = Array.isArray(sessionId)
    ? sessionId
    : (sessionId ?? undefined);

  // const defaultLocalRoomValue = Array.isArray(localRoomId)
  //   ? localRoomId
  //   : (localRoomId ?? undefined);

  return [
    SeatingFormFactory.buildSeatingField({
      options: SeatingMappers.toSessionOptions(seatings),
      defaultValue: defaultSessionValue,
      colSpan: 6,
    }),

    // SeatingFormFactory.buildLocalRoomsField({
    //   options: SeatingMappers.toLocalRoomOptions(localRooms),
    //   defaultValue: defaultLocalRoomValue,
    // }),
  ];
}
