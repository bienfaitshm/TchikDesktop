import {
  schoolService,
  seatingSessionService,
  groupByLocalRoom,
} from "@/packages/@core/data-access/db/queries";

type SeatingResolverParams = {
  yearId?: string;
  schoolId?: string;
  sessionId?: string;
};

export class SeatingSessionDataResolver {
  /**
   * Résout les données nécessaires pour la vue de placement.
   */
  static async resolveData({
    schoolId,
    sessionId,
    yearId,
  }: SeatingResolverParams) {
    if (!schoolId || !yearId || !sessionId) {
      throw new Error(
        "Paramètres requis manquants : schoolId, yearId ou sessionId.",
      );
    }

    const [school, sessionData] = await Promise.all([
      schoolService.fetchSchoolInfo(schoolId, yearId),
      seatingSessionService.getSessionWithAssignments(sessionId),
    ]);

    return {
      school,
      assignment: sessionData ? groupByLocalRoom(sessionData) : [],
    };
  }
}
