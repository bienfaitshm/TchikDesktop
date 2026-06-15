import { ExamOptimizer, RoomReport } from "@/packages/exam-seating-engine";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db";
import { type CustomLogger, getLogger } from "@/packages/logger";
import type { EnrollmentRepository } from "@/packages/@core/data-access/db/queries/enrollments";
import { enrollmentRepository } from "@/packages/@core/data-access/db/queries/enrollments";
import type { EnrolementDetails } from "@/packages/@core/data-access/db/schemas/types";

import { parsePercentage } from "./utils";
import { SeatingSessionMapper } from "./session-mapper";
import { type LocalRoomRepository, localRoomRepository } from "./localrooms";

export interface SeatingConfig {
  comfortRatio: number;
}

export interface DataParams {
  schoolId: string;
  yearId: string;
  classRoomIds: string[];
  localRoomIds: string[];
  comfortRatio?: string | number | null;
}

export class SeatingSessionService {
  public static readonly DEFAULT_CONFIG: SeatingConfig = {
    comfortRatio: 0.7,
  };

  constructor(
    private readonly roomRepo: LocalRoomRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Génère un plan de placement pour les examens basé sur les contraintes physiques des salles
   * et le ratio de confort exigé.
   */
  public async generate(
    data: DataParams,
  ): Promise<RoomReport<EnrolementDetails>[]> {
    const parsedRatio = parsePercentage(data.comfortRatio);

    const comfortRatio =
      parsedRatio > 0
        ? parsedRatio
        : SeatingSessionService.DEFAULT_CONFIG.comfortRatio;

    this.logger.info("Starting seating plan generation", {
      schoolId: data.schoolId,
      yearId: data.yearId,
      classRoomIdsCount: data.classRoomIds.length,
      localRoomIdsCount: data.localRoomIds.length,
      usedRatio: comfortRatio,
    });

    const [dbRooms, dbEnrollments] = await this.fetchData(data);

    if (dbRooms.length === 0 || dbEnrollments.length === 0) {
      this.logger.warn("Generation aborted: Empty datasets encountered", {
        roomsCount: dbRooms.length,
        enrollmentsCount: dbEnrollments.length,
      });
      return [];
    }

    const students = dbEnrollments.map((enrollment) =>
      SeatingSessionMapper.toDomainStudent(enrollment as EnrolementDetails),
    );
    const rooms = dbRooms.map(SeatingSessionMapper.toDomainRoom);

    try {
      const engine = new ExamOptimizer(comfortRatio);
      const reports = engine.generateSeatingPlan(students, rooms);

      this.logger.info("Seating plan generated successfully", {
        totalStudentsProcessed: students.length,
        roomsUtilized: reports.length,
      });

      return reports;
    } catch (error) {
      this.handleError(error, data);
      throw error;
    }
  }

  /**
   * Récupère de manière concurrente les salles et les inscriptions actives requises.
   */
  private async fetchData(params: DataParams) {
    const { schoolId, yearId, classRoomIds, localRoomIds } = params;

    return Promise.all([
      this.roomRepo.findMany({
        where: { schoolId },
        whereIn: { localroomId: localRoomIds },
      }),
      this.enrollmentRepo.findMany({
        where: { schoolId, yearId, status: STUDENT_STATUS_ENUM.ACTIVE },
        whereIn: { classroomId: classRoomIds },
      }),
    ]);
  }

  private handleError(error: unknown, context: DataParams): void {
    const message =
      error instanceof Error ? error.message : "Unknown seating engine error";
    this.logger.error(`[SeatingSessionService] ${message}`, {
      schoolId: context.schoolId,
      yearId: context.yearId,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

export const seatingSessionService = new SeatingSessionService(
  localRoomRepository,
  enrollmentRepository,
  getLogger("SeatingSessionService"),
);
