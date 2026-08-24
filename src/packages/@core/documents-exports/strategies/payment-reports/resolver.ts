import {
  type BaseStudentPaymentFilters,
  type StudentPaymentDTO,
} from "@/packages/@core/data-access/db/queries";
import type { DataResolver } from "@/packages/electron-data-exporter";

/**
 * Input payload required to query payment data.
 */
export interface PaymentResolverPayload {
  schoolId: string;
  yearId: string;
  dateStart?: Date;
  dateEnd?: Date;
}

/**
 * Structure of the resolved payment dataset.
 */
export interface PaymentResolverData {
  payments: StudentPaymentDTO[];
}

/**
 * Data repository interface required for querying student payments.
 */
export interface StudentPaymentRepositoryFetcher {
  findMany(
    params: BaseStudentPaymentFilters,
  ): Promise<StudentPaymentDTO[]> | StudentPaymentDTO[];
}

/**
 * Resolves student payment records for a specific school and academic year.
 */
export class PaymentDataResolver implements DataResolver<
  PaymentResolverPayload,
  PaymentResolverData
> {
  /**
   * Initializes the resolver with its repository dependency.
   * @param paymentRepository - Repository instance used to fetch payment records.
   */
  constructor(
    private readonly paymentRepository: StudentPaymentRepositoryFetcher,
  ) {}

  /**
   * Fetches payment records corresponding to the provided payload identifiers and date range.
   * @param payload - Object containing mandatory schoolId and yearId properties, with optional date filters.
   * @returns Object containing the array of retrieved payment records.
   * @throws Error if schoolId or yearId is missing.
   */
  async resolveData(
    payload: PaymentResolverPayload,
  ): Promise<PaymentResolverData> {
    const { schoolId, yearId, dateStart, dateEnd } = payload;

    if (!schoolId || !yearId) {
      throw new Error("Missing required parameters: schoolId and yearId.");
    }

    const dateFilter =
      dateStart || dateEnd
        ? {
            ...(dateStart ? { $gte: dateStart } : {}),
            ...(dateEnd ? { $lte: dateEnd } : {}),
          }
        : undefined;

    const payments = await this.paymentRepository.findMany({
      where: {
        studentPayments: {
          schoolId,
          yearId,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
      },
    });

    return {
      payments,
    };
  }
}
