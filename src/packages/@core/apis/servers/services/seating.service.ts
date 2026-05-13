import { ExamOptimizer, Student, Room, RoomReport } from "exam-seating-engine";
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
    const config: SeatingConfig = {
      confortRatio: data.confortRatio ?? this.DEFAULT_CONFIG.confortRatio,
      columnsPerRoom: this.DEFAULT_CONFIG.columnsPerRoom,
    };

    this.logger.info("Starting seating plan generation", data);

    const [dbRooms, dbEnrollements] = await this.fetchData(data);

    // Validation des données d'entrée
    if (!dbRooms.length || !dbEnrollements.length) {
      this.logger.warn("Generation aborted: Missing rooms or enrollments", {
        ...data,
        roomCount: dbRooms.length,
        enrollmentCount: dbEnrollements.length,
      });
      return [];
    }

    const students = dbEnrollements.map((enrolement) =>
      SeatingMapper.toDomainStudent(enrolement as TEnrolementDetails),
    );
    const rooms = dbRooms.map(SeatingMapper.toDomainRoom);

    this.logger.debug("Data mapped to domain entities", {
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

      this.logger.info("Seating plan generated successfully", {
        ...data,
        reportCount: reports.length,
        totalStudentsSeated: reports.reduce(
          (acc, r) => acc + r.studentCount,
          0,
        ),
      });

      return reports;
    } catch (error) {
      this.logger.error("Seating engine failed to process plan", {
        ...data,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async fetchData({
    schoolId,
    yearId,
    classRoomIds,
    localRoomIds,
  }: DataParams) {
    try {
      return await Promise.all([
        this.roomRepo.findMany({
          where: { schoolId },
          whereIn: { localRoomId: localRoomIds },
        }),
        this.enrolementRepo.findMany({
          where: { schoolId, yearId, status: STUDENT_STATUS_ENUM.EN_COURS },
          whereIn: {
            classroomId: classRoomIds,
          },
        }),
      ]);
    } catch (error) {
      this.logger.error("Database access failed during seating fetch", {
        schoolId,
        yearId,
        error: error instanceof Error ? error.message : "DB Error",
      });
      throw new Error(`[SeatingService] Database access failed`);
    }
  }
}
