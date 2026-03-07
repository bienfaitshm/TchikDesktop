import { Student, Room, RoomReport, OccupiedSeat } from "./types";
import { shuffleArray } from "./utils";

export class ExamOptimizer {
  private readonly comfortRatio: number;

  /**
   * @param comfortRatio - Target capacity utilization (default: 0.8 for 80%)
   */
  constructor(comfortRatio: number = 0.8) {
    this.comfortRatio = comfortRatio;
  }

  /**
   * Generates an optimized, anti-cheating seating arrangement.
   * * @param students - List of students to place.
   * @param rooms - Available rooms.
   * @param columnsPerRoom - Matrix width for seating generation.
   * @returns Array of detailed room reports.
   * @throws Error if total room capacity is insufficient.
   */
  public generateSeatingPlan(
    students: Student[],
    rooms: Room[],
    columnsPerRoom: number = 5,
  ): RoomReport[] {
    if (!students.length || !rooms.length) return [];

    const activeRooms = this.selectOptimalRooms(rooms, students.length);
    const shuffledStudents = this.interleaveStudents(students);

    const allocations = new Map<string, Student[]>();
    activeRooms.forEach((room) => allocations.set(room.id, []));

    // Round-robin distribution
    shuffledStudents.forEach((student, index) => {
      const roomId = activeRooms[index % activeRooms.length].id;
      allocations.get(roomId)?.push(student);
    });

    return activeRooms.map((room) =>
      this.buildRoomReport(
        room,
        allocations.get(room.id) || [],
        columnsPerRoom,
      ),
    );
  }

  private interleaveStudents(students: Student[]): Student[] {
    const groups: Record<string, Student[]> = {};

    students.forEach((student) => {
      if (!groups[student.classId]) groups[student.classId] = [];
      groups[student.classId].push(student);
    });

    // Shuffle within classes
    Object.keys(groups).forEach((key) => {
      groups[key] = shuffleArray(groups[key]);
    });

    const result: Student[] = [];
    const classIds = Object.keys(groups);
    const maxStudentsInClass = Math.max(
      ...Object.values(groups).map((g) => g.length),
    );

    // Round-robin interleaving to separate classmates
    for (let i = 0; i < maxStudentsInClass; i++) {
      for (const classId of classIds) {
        if (groups[classId][i]) {
          result.push(groups[classId][i]);
        }
      }
    }

    return result;
  }

  private selectOptimalRooms(
    rooms: Room[],
    totalStudentsNeeded: number,
  ): Room[] {
    // Sort by capacity descending to minimize the number of required supervisors
    const sortedRooms = [...rooms].sort(
      (a, b) => b.maxCapacity - a.maxCapacity,
    );
    const selectedRooms: Room[] = [];
    let accumulatedCapacity = 0;

    for (const room of sortedRooms) {
      selectedRooms.push(room);
      accumulatedCapacity += room.maxCapacity * this.comfortRatio;
      if (accumulatedCapacity >= totalStudentsNeeded) break;
    }

    // Failsafe: check if we actually have enough space
    const totalRawCapacity = selectedRooms.reduce(
      (sum, r) => sum + r.maxCapacity,
      0,
    );
    if (totalRawCapacity < totalStudentsNeeded) {
      throw new Error(
        `Insufficient capacity. Need space for ${totalStudentsNeeded} students.`,
      );
    }

    return selectedRooms;
  }

  private buildRoomReport(
    room: Room,
    students: Student[],
    columns: number,
  ): RoomReport {
    const seatingPlan: OccupiedSeat[] = students.map((student, index) => ({
      row: Math.floor(index / columns),
      column: index % columns,
      student,
    }));

    const occupancyRate = students.length / room.maxCapacity;

    return {
      roomName: room.name,
      seatingPlan,
      studentCount: students.length,
      occupancyRate: Number(occupancyRate.toFixed(2)),
      isOverloaded: students.length > room.maxCapacity,
    };
  }
}
