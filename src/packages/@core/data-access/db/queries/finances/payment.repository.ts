import { eq, and, sql, desc, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  wallets,
  feeConfigurations,
  feeAssignments,
  studentPayments,
  dailyExchangeRates,
  classrooms,
} from "@/packages/@core/data-access/db/schemas";
import { BaseRepository } from "../base-repository";

export class PaymentRepository extends BaseRepository<
  typeof studentPayments,
  TDataBase
> {
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: studentPayments,
      idColumn: studentPayments.paymentId,
      entityName: "StudentPayment",
      logger: getLogger,
    });
  }

  // Obtenir le taux du jour le plus récent pour un couple de devises
  async getLatestExchangeRate(
    ctx: { schoolId: string; date: string; from: string; to: string },
    tx: TDataBase = this.db,
  ) {
    const [rate] = await tx
      .select()
      .from(dailyExchangeRates)
      .where(
        and(
          eq(dailyExchangeRates.schoolId, ctx.schoolId),
          eq(dailyExchangeRates.date, ctx.date),
          eq(dailyExchangeRates.currencyFrom, ctx.from),
          eq(dailyExchangeRates.currencyTo, ctx.to),
        ),
      );
    return rate;
  }

  // Récupérer une attribution avec sa configuration et son portefeuille (Verrouillage pour écriture)
  async getFeeAssignmentWithConfig(
    assignmentId: string,
    tx: TDataBase = this.db,
  ) {
    const [result] = await tx
      .select({
        assignment: getTableColumns(feeAssignments),
        config: getTableColumns(feeConfigurations),
      })
      .from(feeAssignments)
      .innerJoin(
        feeConfigurations,
        eq(feeAssignments.feeConfigId, feeConfigurations.feeConfigId),
      )
      .where(eq(feeAssignments.assignmentId, assignmentId));
    return result;
  }

  // Mettre à jour le solde d'un portefeuille (Incrémentation atomique)
  async incrementWalletBalance(
    walletId: string,
    amount: number,
    tx: TDataBase = this.db,
  ) {
    await tx
      .update(wallets)
      .set({
        currentBalance: sql`${wallets.currentBalance} + ${amount}`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(wallets.walletId, walletId));
  }

  // Mettre à jour l'état d'avancement de la dette de l'élève
  async updateAssignmentProgress(
    assignmentId: string,
    amountConverted: number,
    totalAmount: number,
    tx: TDataBase = this.db,
  ) {
    const [current] = await tx
      .select({ amountPaid: feeAssignments.amountPaid })
      .from(feeAssignments)
      .where(eq(feeAssignments.assignmentId, assignmentId));

    const newAmountPaid = (current?.amountPaid ?? 0) + amountConverted;
    let newStatus = "PARTIAL";

    if (newAmountPaid >= totalAmount) {
      newStatus = "PAID";
    } else if (newAmountPaid <= 0) {
      newStatus = "UNPAID";
    }

    await tx
      .update(feeAssignments)
      .set({
        amountPaid: newAmountPaid,
        status: newStatus as any,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(feeAssignments.assignmentId, assignmentId));
  }

  // Trouver toutes les configurations applicables à une classe ou une option
  async findApplicableConfigurations(
    ctx: {
      schoolId: string;
      yearId: string;
      classroomId: string;
      optionId: string | null;
    },
    tx: TDataBase = this.db,
  ) {
    return await tx
      .select()
      .from(feeConfigurations)
      .where(
        and(
          eq(feeConfigurations.schoolId, ctx.schoolId),
          eq(feeConfigurations.yearId, ctx.yearId),
          sql`(${feeConfigurations.classroomId} = ${ctx.classroomId}) OR (${feeConfigurations.optionId} = ${ctx.optionId})`,
        ),
      );
  }
}
