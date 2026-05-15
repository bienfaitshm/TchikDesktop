import {
  ExamOptimizer,
  Student,
  Room,
  RoomReport,
} from "@/packages/exam-seating-engine";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db";
import type { CustomLogger } from "@/packages/logger";
import type {
  LocalRoomQuery,
  EnrolementQuery,
} from "@/packages/@core/data-access/db/queries";
import type {
  TEnrolementDetails,
  TLocalRoom,
} from "@/packages/@core/data-access/db/schemas/types";

export type StudentReport = Student & Pick<TEnrolementDetails, "classroom">;
export type TSeatingGenerator = RoomReport<StudentReport>;

interface SeatingConfig {
  confortRatio: number;
  columnsPerRoom: number;
}

interface DataParams {
  localRoomIds: string[];
  classRoomIds: string[];
  confortRatio: number;
  schoolId: string;
  yearId: string;
}

const SeatingMapper = {
  toDomainStudent(enrollement: TEnrolementDetails): StudentReport {
    return {
      id: enrollement.enrolementId,
      name: [
        enrollement.student.lastName,
        enrollement.student.middleName,
        enrollement.student.firstName,
      ]
        .filter(Boolean)
        .join(" "),
      classId: enrollement.classroomId,
      classroom: enrollement.classroom,
    };
  },

  toDomainRoom(dbRoom: TLocalRoom): Room {
    return {
      id: dbRoom.localRoomId,
      maxCapacity: dbRoom.maxCapacity,
      name: dbRoom.name,
      columns: dbRoom.totalColumns,
    };
  },
};

export class SeatingService {
  private readonly DEFAULT_CONFIG: SeatingConfig = {
    confortRatio: 0.7,
    columnsPerRoom: 5,
  };

  constructor(
    private readonly roomRepo: LocalRoomQuery,
    private readonly enrolementRepo: EnrolementQuery,
    private readonly logger: CustomLogger,
  ) {}

  public async generate(data: DataParams): Promise<TSeatingGenerator[]> {
    const parsedRatio = parsePercentage(data.confortRatio);
    const confortRatio =
      parsedRatio > 0 ? parsedRatio : this.DEFAULT_CONFIG.confortRatio;

    this.logger.info("Starting seating plan generation", {
      ...data,
      usedRatio: confortRatio,
    });

    const [dbRooms, dbEnrollements] = await this.fetchData(data);

    if (!dbRooms.length || !dbEnrollements.length) {
      this.logger.warn("Generation aborted: Empty datasets", {
        rooms: dbRooms.length,
        enrollments: dbEnrollements.length,
      });
      return [];
    }

    const students = dbEnrollements.map((enrollement) =>
      SeatingMapper.toDomainStudent(enrollement as TEnrolementDetails),
    );
    const rooms = dbRooms.map(SeatingMapper.toDomainRoom);

    try {
      const engine = new ExamOptimizer(confortRatio);
      const reports = engine.generateSeatingPlan(students, rooms);

      this.logger.info("Seating plan generated", {
        totalStudents: students.length,
        roomsUsed: reports.length,
      });

      return reports;
    } catch (error) {
      this.handleError(error, data);
      throw error;
    }
  }

  private async fetchData(params: DataParams) {
    const { schoolId, yearId, classRoomIds, localRoomIds } = params;

    return Promise.all([
      this.roomRepo.findMany({
        where: { schoolId },
        whereIn: { localRoomId: localRoomIds },
      }),
      this.enrolementRepo.findMany({
        where: { schoolId, yearId, status: STUDENT_STATUS_ENUM.EN_COURS },
        whereIn: { classroomId: classRoomIds },
      }),
    ]);
  }

  private handleError(error: unknown, context: DataParams): void {
    const message =
      error instanceof Error ? error.message : "Unknown seating error";
    this.logger.error(`[SeatingService] ${message}`, {
      ...context,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Convertit une valeur (string ou number) en ratio décimal.
 * Supporte : "70%", "70", 70, "0.7", "70,5%"
 */
export const parsePercentage = (
  input: string | number | null | undefined,
): number => {
  if (input === null || input === undefined || input === "") {
    return 0;
  }

  if (typeof input === "number") {
    return input / 100;
  }

  const normalized = input.trim().replace("%", "").replace(",", ".");

  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) {
    console.warn(`[parsePercentage] Valeur invalide reçue: ${input}`);
    return 0;
  }

  return parsed / 100;
};
