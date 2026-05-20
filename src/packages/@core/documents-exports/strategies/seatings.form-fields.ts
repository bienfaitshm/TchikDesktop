import type { FormFieldDef } from "@/packages/dynamic-form";
import { seatingSessionService } from "@/packages/@core/data-access/db/queries";
import { SeatingFormFactory } from "../form-factory";

export type TCreateSeatingFormParams = {
  yearId?: string;
  schoolId?: string;
  sessionId?: string;
};

export const SeatingMappers = {
  toSessionOptions: (
    sessions: Awaited<ReturnType<typeof seatingSessionService.findMany>>,
  ) =>
    sessions.map((session) => ({
      label: session.sessionName,
      value: session.sessionId,
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
  ]);

  const defaultSessionValue = Array.isArray(sessionId)
    ? sessionId[0]
    : (sessionId ?? undefined);

  return [
    SeatingFormFactory.buildSeatingField({
      options: SeatingMappers.toSessionOptions(seatings),
      defaultValue: defaultSessionValue,
      colSpan: 6,
    }),
  ];
}
