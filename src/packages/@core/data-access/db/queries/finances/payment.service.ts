import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { eq, and, sql } from "drizzle-orm";
import { PaymentRepository } from "./payment.repository";
import {
  feeAssignments,
  classroomEnrollments,
  classrooms,
} from "@/packages/@core/data-access/db/schemas";

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
   * TACHE DE FOND : Synchronisation globale et Idempotente des dettes d'une année
   */
  async syncAllStudentAssignments(filters: {
    schoolId: string;
    yearId: string;
  }) {
    if (!filters.schoolId || !filters.yearId) {
      throw new Error("schoolId et yearId requis pour la synchronisation.");
    }

    // 1. Récupérer toutes les inscriptions de l'année avec les infos de classe/option
    const activeEnrollments = await this.clientDb
      .select({
        enrollmentId: classroomEnrollments.enrollmentId,
        classroomId: classroomEnrollments.classroomId,
        optionId: classrooms.optionId,
      })
      .from(classroomEnrollments)
      .innerJoin(
        classrooms,
        eq(classroomEnrollments.classroomId, classrooms.classId),
      )
      .where(
        and(
          eq(classroomEnrollments.schoolId, filters.schoolId),
          eq(classroomEnrollments.yearId, filters.yearId),
          eq(classroomEnrollments.status, "ACTIVE" as any),
        ),
      );

    console.log(
      `[Sync Background] Début du traitement pour ${activeEnrollments.length} élèves.`,
    );

    // 2. Traiter chaque élève de manière isolée dans une transaction
    for (const enrollment of activeEnrollments) {
      await this.clientDb.transaction(async (tx) => {
        // Trouver toutes les configurations de frais applicables à cet élève (via sa classe ou son option)
        const applicableConfigs =
          await this.paymentRepo.findApplicableConfigurations(
            {
              schoolId: filters.schoolId,
              yearId: filters.yearId,
              classroomId: enrollment.classroomId,
              optionId: enrollment.optionId,
            },
            tx,
          );

        for (const config of applicableConfigs) {
          // Vérifier si cette assignation existe déjà pour l'élève
          const [existingAssignment] = await tx
            .select()
            .from(feeAssignments)
            .where(
              and(
                eq(feeAssignments.enrollmentId, enrollment.enrollmentId),
                eq(feeAssignments.feeConfigId, config.feeConfigId),
              ),
            );

          if (!existingAssignment) {
            // --- ACTION A : CREATION (Frais configuré APRES l'inscription) ---
            await tx.insert(feeAssignments).values({
              enrollmentId: enrollment.enrollmentId,
              feeConfigId: config.feeConfigId,
              amountPaid: 0,
              status: "UNPAID",
            });
            console.log(
              `[Sync] Assignation créée pour l'élève ${enrollment.enrollmentId} - Frais: ${config.name}`,
            );
          } else {
            // --- ACTION B : MISE À JOUR / RECALCUL DU STATUT ---
            // Si le frais existait déjà, on réévalue son statut par rapport au montant total (au cas où le prix total totalAmount a été modifié entre temps)
            let newStatus = "PARTIAL";
            if (existingAssignment.amountPaid >= config.totalAmount) {
              newStatus = "PAID";
            } else if (existingAssignment.amountPaid <= 0) {
              newStatus = "UNPAID";
            }

            // Si le statut calculé est différent du statut stocké, on met à jour
            if (existingAssignment.status !== newStatus) {
              await tx
                .update(feeAssignments)
                .set({
                  status: newStatus as any,
                  updatedAt: sql`CURRENT_TIMESTAMP`,
                })
                .where(
                  eq(
                    feeAssignments.assignmentId,
                    existingAssignment.assignmentId,
                  ),
                );
              console.log(
                `[Sync] Statut mis à jour pour l'assignation ${existingAssignment.assignmentId} -> ${newStatus}`,
              );
            }
          }
        }
      });
    }

    console.log(`[Sync Background] Synchronisation terminée avec succès.`);
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
