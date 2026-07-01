import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { PaymentRepository } from "./payment.repository";
import { feeAssignments } from "@/packages/@core/data-access/db/schemas";

export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly clientDb: TDataBase = db,
  ) {}

  private validateContext(
    schoolId?: string,
    yearId?: string,
  ): asserts schoolId is string {
    if (!schoolId || !yearId) {
      throw new Error("Missing Context: schoolId and yearId are required.");
    }
  }

  /**
   * ACTION AUTOMATIQUE : Générer la dette d'un élève lors de son inscription active
   */
  async assignFeesToStudent(
    payload: {
      schoolId: string;
      yearId: string;
      enrollmentId: string;
      classroomId: string;
      optionId: string | null;
    },
    tx: TDataBase = this.clientDb,
  ) {
    this.validateContext(payload.schoolId, payload.yearId);

    // 1. Chercher les frais qui ciblent sa classe ou son option (XOR)
    const configs = await this.paymentRepo.findApplicableConfigurations(
      payload,
      tx,
    );

    // 2. Générer les lignes d'obligations financières
    for (const config of configs) {
      await tx
        .insert(feeAssignments)
        .values({
          enrollmentId: payload.enrollmentId,
          feeConfigId: config.feeConfigId,
          amountPaid: 0,
          status: "UNPAID",
        })
        .onConflictDoNothing(); // Évite les doublons en cas de ré-inscription accidentelle
    }
  }

  /**
   * ACTION CENTRALISÉE : Encaisser un versement au guichet (Multi-devises & Portefeuille)
   */
  async processStudentPayment(payload: {
    schoolId: string;
    yearId: string;
    assignmentId: string;
    amountReceived: number; // En centimes
    currencyReceived: "USD" | "CDF";
    paymentMethod: "CASH" | "MOBILE_MONEY" | "BANK";
    transactionReference?: string;
  }) {
    this.validateContext(payload.schoolId, payload.yearId);

    return await this.clientDb.transaction(async (tx) => {
      // 1. Récupérer le dossier de dette de l'élève
      const target = await this.paymentRepo.getFeeAssignmentWithConfig(
        payload.assignmentId,
        tx,
      );
      if (!target)
        throw new Error("Dossier d'attribution de frais introuvable.");

      const { config, assignment } = target;
      let amountConverted = payload.amountReceived;
      let exchangeRateMultiplied = 1000000; // Taux de 1:1 par défaut (Même monnaie)

      // 2. Traitement de la conversion si devises différentes
      if (config.currency !== payload.currencyReceived) {
        const rateRow = await this.paymentRepo.getLatestExchangeRate(
          {
            schoolId: payload.schoolId,
            date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            from: payload.currencyReceived,
            to: config.currency as "USD" | "CDF",
          },
          tx,
        );

        if (!rateRow) {
          throw new Error(
            `Aucun taux de change défini aujourd'hui pour convertir le ${payload.currencyReceived} en ${config.currency}.`,
          );
        }

        exchangeRateMultiplied = rateRow.rate;

        // Formule de conversion avec la précision à base d'entier multiplicateur (1 000 000)
        amountConverted = Math.round(
          (payload.amountReceived * 1000000) / exchangeRateMultiplied,
        );
      }

      // 3. Sécurité contre les trop-perçus
      const remainingDebt = config.totalAmount - assignment.amountPaid;
      if (amountConverted > remainingDebt) {
        throw new Error(
          `Le montant versé dépasse le reste à payer de cet élève (${remainingDebt / 100} ${config.currency}).`,
        );
      }

      // 4. Insérer le reçu de paiement immuable
      const [newPayment] = await this.paymentRepo.create(
        {
          assignmentId: payload.assignmentId,
          amountReceived: payload.amountReceived,
          currencyReceived: payload.currencyReceived,
          appliedExchangeRate: exchangeRateMultiplied,
          amountConverted: amountConverted,
          paymentMethod: payload.paymentMethod,
          transactionReference: payload.transactionReference,
        },
        tx,
      );

      // 5. Mettre à jour l'amortissement de la dette de l'élève
      await this.paymentRepo.updateAssignmentProgress(
        payload.assignmentId,
        amountConverted,
        config.totalAmount,
        tx,
      );

      // 6. Alimenter la caisse physique réelle du portefeuille
      // Règle comptable : On alimente le portefeuille selon sa monnaie native
      await this.paymentRepo.incrementWalletBalance(
        config.walletId,
        amountConverted,
        tx,
      );

      return newPayment;
    });
  }
}

export const paymentRepository = new PaymentRepository();
export const paymentService = new PaymentService(paymentRepository);
