import type { Localroom } from "@/packages/@core/data-access/db/schemas";
import type { Student, Room, RoomReport } from "@/packages/exam-seating-engine";

import { withFullName } from "@/packages/@core/data-access/db/queries/query-utils";
import {
  Assignment,
  SeatingSessionGrouped,
  SeatingSessionWithAssignment,
} from "./type";
import { EnrollmentDTO } from "../enrollments";

export type StudentReport = Student & Pick<EnrollmentDTO, "classroom">;
export type TSeatingGenerator = RoomReport<StudentReport>;

export class SeatingSessionMapper {
  static toDomainStudent(enrollment: EnrollmentDTO): StudentReport {
    return {
      id: enrollment.enrollmentId,
      name: [
        enrollment.student.lastName,
        enrollment.student.middleName,
        enrollment.student.firstName,
      ]
        .filter(Boolean)
        .join(" "),
      ...enrollment.student,
      classId: enrollment.classroomId,
      classroom: enrollment.classroom,
    };
  }

  static toDomainRoom(dbRoom: Localroom): Room {
    return {
      id: dbRoom.localroomId,
      maxCapacity: dbRoom.maxCapacity,
      name: dbRoom.name,
      columns: dbRoom.totalColumns,
    };
  }

  /**
   * Groupe les affectations d'une session par salle (localRoom).
   */
  static groupByLocalRoom(
    sessionData: SeatingSessionWithAssignment,
  ): SeatingSessionGrouped {
    const grouped = sessionData.assignments.reduce(
      (acc, assignment) => {
        const { localroomId, localroom, enrollment } = assignment;

        if (!acc[localroomId]) {
          acc[localroomId] = {
            ...localroom,
            students: [],
          };
        }

        const studentWithFormattedName: Assignment = {
          ...assignment,
          seat: `${assignment.rowPosition}-${assignment.columnPosition}`,
          enrollment: {
            ...enrollment,
            student: withFullName(enrollment.student),
          },
        };

        acc[localroomId].students.push(studentWithFormattedName);
        return acc;
      },
      {} as Record<string, Localroom & { students: Assignment[] }>,
    );

    return {
      ...sessionData,
      assignments: Object.values(grouped),
    };
  }
}
