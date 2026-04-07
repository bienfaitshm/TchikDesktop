import { ExamOptimizer, Student, Room } from "exam-seating-engine";
import {
  localRoomService,
  enrolementService,
} from "@/packages/@core/data-access/db/queries";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db";

type SeatingGeneratorParams = {
  confortRatio?: number;
  schoolId: string;
  yearId: string;
};

export async function seatingGenerator({
  schoolId,
  yearId,
  confortRatio = 0.7,
}: SeatingGeneratorParams) {
  const [localRooms, enrollements] = await Promise.all([
    localRoomService.findMany({ where: { schoolId } }),
    enrolementService.findManyExtended({
      where: { schoolId, yearId, status: STUDENT_STATUS_ENUM.EN_COURS },
    }),
  ]);

  // 2. Logging plus intelligent (uniquement en dev ou partiel)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `Matching ${enrollements.length} students with ${localRooms.length} rooms.`,
    );
  }

  const engine = new ExamOptimizer(confortRatio);

  const students: Student[] = enrollements.map(
    ({ enrolementId, classroomId, student }) => {
      // On filtre les noms vides pour éviter les doubles espaces ou espaces traînants
      const fullName = [student.lastName, student.middleName, student.firstName]
        .filter(Boolean)
        .join(" ");

      return {
        id: enrolementId,
        name: fullName,
        classId: classroomId,
      };
    },
  );

  // 4. Mapping des Salles
  const rooms: Room[] = localRooms.map(
    ({ localRoomId, maxCapacity, name }) => ({
      id: localRoomId,
      maxCapacity,
      name,
    }),
  );

  try {
    const reports = engine.generateSeatingPlan(students, rooms, 5); // 5 columns per room
    console.log(reports[0].seatingPlan);
    console.log(JSON.stringify(reports, null, 4));
    return reports;
  } catch (error) {
    console.error("Failed to generate plan:", error.message);
  }
}
