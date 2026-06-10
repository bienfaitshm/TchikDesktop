import {
  schoolRepository,
  seatingSessionService,
  groupByLocalRoom,
} from "@/packages/@core/data-access/db/queries";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

type SeatingResolverParams = {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
  sessionId: string;
  nDays: number;
};

export class SeatingPresenceSessionDataResolver {
  /**
   * Résout les données nécessaires pour la vue de placement.
   */
  static async resolveData({
    schoolId,
    sessionId,
    yearId,
    nDays,
  }: SeatingResolverParams) {
    if (!schoolId || !yearId || !sessionId) {
      throw new Error(
        "Paramètres requis manquants : schoolId, yearId ou sessionId.",
      );
    }
    const days = Array.from({ length: nDays }, (_, i) => i);
    const [school, sessionData] = await Promise.all([
      schoolRepository.fetchSchoolInfo(schoolId, yearId),
      seatingSessionService.getSessionWithAssignments(sessionId),
    ]);

    return {
      school,
      assignment: sessionData ? groupByLocalRoom(sessionData) : [],
      days,
    };
  }
}
