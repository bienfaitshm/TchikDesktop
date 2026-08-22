import {
  schoolInfoService,
  studentPaymentRepository,
} from "@/packages/@core/data-access/db/queries";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

type PaymentResolverParams = {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
};

export class PaymentDataResolver {
  /**
   * Résout les données nécessaires pour la vue de placement.
   */
  static async resolveData({ schoolId, yearId }: PaymentResolverParams) {
    if (!schoolId || !yearId) {
      throw new Error(
        "Paramètres requis manquants : schoolId, yearId ou sessionId.",
      );
    }
    const [school, payments] = await Promise.all([
      schoolInfoService.getSchoolInfo(schoolId, yearId),
      studentPaymentRepository.findMany({
        where: { studentPayments: { schoolId, yearId } },
      }),
    ]);

    return {
      school,
      payments,
    };
  }
}
