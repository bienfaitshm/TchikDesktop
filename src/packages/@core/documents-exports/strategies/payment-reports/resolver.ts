import {
  studentPaymentRepository,
  type StudentPaymentDTO,
} from "@/packages/@core/data-access/db/queries";
import type { DataResolver } from "@/packages/electron-data-exporter";

/**
 * Input payload required to query payment data.
 */
export interface PaymentResolverPayload {
  schoolId: string;
  yearId: string;
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
  findMany(params: {
    where: { studentPayments: { schoolId: string; yearId: string } };
  }): Promise<StudentPaymentDTO[]> | StudentPaymentDTO[];
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
    private readonly paymentRepository: StudentPaymentRepositoryFetcher = studentPaymentRepository,
  ) {}

  /**
   * Fetches payment records corresponding to the provided payload identifiers.
   * @param payload - Object containing mandatory schoolId and yearId properties.
   * @returns Object containing the array of retrieved payment records.
   * @throws Error if schoolId or yearId is missing.
   */
  async resolveData(
    payload: PaymentResolverPayload,
  ): Promise<PaymentResolverData> {
    const { schoolId, yearId } = payload;

    if (!schoolId || !yearId) {
      throw new Error("Missing required parameters: schoolId and yearId.");
    }

    const payments = await this.paymentRepository.findMany({
      where: { studentPayments: { schoolId, yearId } },
    });

    return {
      payments,
    };
  }
}
