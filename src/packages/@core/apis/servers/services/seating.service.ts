import { ExamOptimizer, Student, Room, RoomReport } from "exam-seating-engine";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db";
import { getLogger } from "@/packages/logger";
import type {
  LocalRoomQuery,
  EnrolementQuery,
} from "@/packages/@core/data-access/db/queries";
import type { TEnrolementDetails } from "@/packages/@core/data-access/db/schemas/types";

export type StudentReport = Student & Pick<TEnrolementDetails, "classroom">;
export type TSeatingGenerator = RoomReport<StudentReport>;

interface SeatingConfig {
  confortRatio: number;
  columnsPerRoom: number;
}

const logger = getLogger("SeatingService");

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

  toDomainRoom(dbRoom: any): Room {
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
  ) {}

  public async generate<T extends {}>(
    schoolId: string,
    yearId: string,
    options?: T,
  ): Promise<TSeatingGenerator[]> {
    const config = { ...this.DEFAULT_CONFIG, ...(options ?? {}) };

    logger.info("Starting seating plan generation", {
      schoolId,
      yearId,
      config,
    });

    const [dbRooms, dbEnrollements] = await this.fetchData(schoolId, yearId);

    // Validation des données d'entrée
    if (!dbRooms.length || !dbEnrollements.length) {
      logger.warn("Generation aborted: Missing rooms or enrollments", {
        schoolId,
        roomCount: dbRooms.length,
        enrollmentCount: dbEnrollements.length,
      });
      return [];
    }

    const students = dbEnrollements.map(SeatingMapper.toDomainStudent);
    const rooms = dbRooms.map(SeatingMapper.toDomainRoom);

    logger.debug("Data mapped to domain entities", {
      studentCount: students.length,
      roomCount: rooms.length,
    });

    try {
      const engine = new ExamOptimizer(config.confortRatio);
      const reports = engine.generateSeatingPlan(
        students,
        rooms,
        config.columnsPerRoom,
      );

      logger.info("Seating plan generated successfully", {
        schoolId,
        reportCount: reports.length,
        totalStudentsSeated: reports.reduce(
          (acc, r) => acc + r.studentCount,
          0,
        ),
      });

      return reports;
    } catch (error) {
      logger.error("Seating engine failed to process plan", {
        schoolId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async fetchData(schoolId: string, yearId: string) {
    try {
      return await Promise.all([
        this.roomRepo.findMany({ where: { schoolId } }),
        this.enrolementRepo.findManyExtended({
          where: { schoolId, yearId, status: STUDENT_STATUS_ENUM.EN_COURS },
        }),
      ]);
    } catch (error) {
      logger.error("Database access failed during seating fetch", {
        schoolId,
        yearId,
        error: error instanceof Error ? error.message : "DB Error",
      });
      throw new Error(`[SeatingService] Database access failed`);
    }
  }
}
