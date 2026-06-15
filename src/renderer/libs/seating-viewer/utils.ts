import type { SeatingAssignmentCreate } from "@/packages/@core/data-access/schema-validations";

export type Gender = "F" | "M";
export interface Classroom {
  identifier: string;
  optionId: string;
  section: string;
  shortIdentifier: string;
  yearId: string;
}
export interface Student {
  id: string;
  name: string;
  gender?: Gender;
  classId: string;
  classroom: Classroom;
}

export interface Seating {
  column: number;
  row: number;
  student: Student | null;
}

export interface RoomState {
  seatingPlan: Seating[];
  roomId: string;
  roomName: string;
  studentCount: number;
  maxCapacity?: number;
  isOverloaded?: boolean;
  occupancyRate?: number;
}

export type StudentSeating = {
  fullName: string;
  identifier: string;
  classroomId: string;
  gender?: Gender;
  row: number;
  column: number;
};

/**
 * Transforme l'état des salles en un payload plat prêt pour l'API (Bulk Assign).
 */
export const formatRoomsToSeatingAssignments = (
  rooms: RoomState[],
  sessionId: string,
): SeatingAssignmentCreate[] => {
  return Object.values(rooms).flatMap((room) =>
    room.seatingPlan
      .filter((seat) => seat.student !== null)
      .map((seat) => ({
        localroomId: room.roomId,
        enrollmentId: seat.student!.id,
        sessionId,
        rowPosition: seat.row,
        columnPosition: seat.column,
      })),
  );
};

/**
 * Extrait les informations d'affichage des étudiants à partir d'un plan de salle.
 */
export const getStudentPlacementDetails = (
  seatingPlan: Seating[],
): StudentSeating[] => {
  return seatingPlan
    .filter(
      (seat): seat is Seating & { student: Student } => seat.student !== null,
    )
    .map((seat) => ({
      fullName: seat.student.name,
      identifier: seat.student.classroom.identifier,
      classroomId: seat.student.classId,
      gender: seat.student.gender,
      row: seat.row,
      column: seat.column,
    }));
};
