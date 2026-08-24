import {
  type ClassroomService,
  type FeeTypeRepository,
  type ClassroomWithEnrollment,
  FeeTypeWithSchedulesDTO,
  classroomService,
  feeTypeRepository,
} from "@/packages/@core/data-access/db";
import type { DataResolver } from "@/packages/electron-data-exporter";
import { formatDate } from "@/packages/times";

/**
 * Input payload required to query payment and classroom export data.
 */
export interface PaymentResolverPayload {
  schoolId: string;
  yearId: string;
  classId?: string[];
  feeTypeId?: string[];
}

/**
 * Structure of the resolved classroom and fee type dataset.
 */
export interface PaymentResolverData {
  feetypes: FeeTypeWithSchedulesDTO[];
  classrooms: ClassroomWithEnrollment[];
  generatedDate: string;
}

/**
 * Resolves classroom reports and fee type configurations for data export operations.
 */
export class PaymentDataResolver implements DataResolver<
  PaymentResolverPayload,
  PaymentResolverData
> {
  /**
   * Initializes the payment data resolver with required service dependencies.
   * @param classroomService - Service instance handling classroom data operations and transformations.
   * @param feeTypeRepository - Repository instance used to query fee types and schedules.
   */
  constructor(
    private readonly classroomServ: ClassroomService = classroomService,
    private readonly feeTypeRepo: FeeTypeRepository = feeTypeRepository,
  ) {}

  /**
   * Resolves fee types and classroom reports corresponding to the provided payload criteria.
   * @param payload - Query criteria containing schoolId, yearId, and optional filtering arrays.
   * @returns Object containing retrieved fee types and classroom reports.
   */
  async resolveData(
    payload: PaymentResolverPayload,
  ): Promise<PaymentResolverData> {
    const [feetypes, classrooms] = await Promise.all([
      this.feeTypeRepo.getFeeTypeWithSchedules({
        where: {
          feeTypes: {
            schoolId: payload.schoolId,
            yearId: payload.yearId,
            ...(payload.feeTypeId && payload.feeTypeId.length > 0
              ? { feeTypeId: { $in: payload.feeTypeId } }
              : {}),
          },
        },
      }),
      this.classroomServ.getClassroomsReport({
        classroom: {
          where: {
            classrooms: {
              ...(payload.classId && payload.classId.length > 0
                ? { classId: { $in: payload.classId } }
                : {}),
            },
          },
          orderBy: [
            {
              table: "classrooms",
              column: "identifier",
              order: "asc",
            },
          ],
        },
        enrollment: {
          where: {
            classroomEnrollments: {
              yearId: payload.yearId,
              schoolId: payload.schoolId,
            },
          },
        },
      }),
    ]);

    return {
      feetypes,
      classrooms,
      generatedDate: formatDate(new Date()),
    };
  }
}
