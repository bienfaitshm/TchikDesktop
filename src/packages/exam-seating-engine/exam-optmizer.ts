import { Student, Room, RoomReport, OccupiedSeat } from "./types";
import { shuffleArray } from "./utils";

export class ExamOptimizer {
  private readonly comfortRatio: number;

  /**
   * Initialise le moteur d'optimisation.
   * @param comfortRatio - Ratio de confort cible (défaut: 0.8 pour 80% d'occupation).
   */
  constructor(comfortRatio: number = 0.8) {
    this.comfortRatio = comfortRatio;
  }

  /**
   * Génère un plan de salle optimisé et anti-triche.
   * Remplit les salles de manière séquentielle en respectant le comfortRatio.
   * * @param students - Liste des étudiants à placer.
   * @param rooms - Salles disponibles.
   * @param defaultColumnsPerRoom - Largeur de matrice par défaut si la salle ne la précise pas.
   * @returns Un tableau de rapports détaillés par salle.
   * @throws Error si la capacité totale est insuffisante.
   */
  public generateSeatingPlan<T extends Student>(
    students: T[],
    rooms: Room[],
    defaultColumnsPerRoom: number = 5,
  ): RoomReport<T>[] {
    if (!students.length || !rooms.length) return [];

    const shuffledStudents = [...this.interleaveStudents(students)];
    const activeRooms = this.selectOptimalRooms(rooms, students.length);

    const allocations = new Map<string, T[]>(
      activeRooms.map((r) => [r.id, []]),
    );

    let currentRoomIdx = 0;

    for (const student of shuffledStudents) {
      let found = false;
      for (let i = 0; i < activeRooms.length; i++) {
        const idx = (currentRoomIdx + i) % activeRooms.length;
        const room = activeRooms[idx];
        const currentAlloc = allocations.get(room.id)!;

        if (
          currentAlloc.length < Math.floor(room.maxCapacity * this.comfortRatio)
        ) {
          currentAlloc.push(student);
          currentRoomIdx = (idx + 1) % activeRooms.length;
          found = true;
          break;
        }
      }

      if (!found) {
        for (let i = 0; i < activeRooms.length; i++) {
          const idx = (currentRoomIdx + i) % activeRooms.length;
          const room = activeRooms[idx];
          const currentAlloc = allocations.get(room.id)!;

          if (currentAlloc.length < room.maxCapacity) {
            currentAlloc.push(student);
            currentRoomIdx = (idx + 1) % activeRooms.length;
            found = true;
            break;
          }
        }
      }
    }

    return activeRooms
      .map((room) =>
        this.buildRoomReport(
          room,
          allocations.get(room.id)!,
          room.columns ?? defaultColumnsPerRoom,
        ),
      )
      .sort((a, b) => a.roomName.localeCompare(b.roomName));
  }

  /**
   * Groupe, mélange aléatoirement et entrelace les étudiants pour maximiser
   * la distance physique entre les membres d'une même classe.
   * * @param students - Liste globale des étudiants.
   * @returns Une liste linéaire d'étudiants entrelacés.
   */
  private interleaveStudents<T extends Student>(students: T[]): T[] {
    const groups: Record<string, T[]> = {};

    for (const student of students) {
      if (!groups[student.classId]) groups[student.classId] = [];
      groups[student.classId].push(student);
    }

    const classIds = Object.keys(groups);
    let maxStudentsInClass = 0;

    for (const key of classIds) {
      groups[key] = shuffleArray(groups[key]);
      if (groups[key].length > maxStudentsInClass) {
        maxStudentsInClass = groups[key].length;
      }
    }

    const result: T[] = [];

    for (let i = 0; i < maxStudentsInClass; i++) {
      for (const classId of classIds) {
        if (groups[classId][i]) {
          result.push(groups[classId][i]);
        }
      }
    }

    return result;
  }

  /**
   * Sélectionne les salles en utilisant la capacité de confort comme métrique.
   * On trie par capacité décroissante pour minimiser le nombre de salles (et donc de surveillants).
   * * @param rooms - Liste des salles disponibles.
   * @param totalStudentsNeeded - Nombre total d'étudiants à placer.
   * @returns Un sous-ensemble de salles suffisant pour respecter le comfortRatio.
   * @throws Error si même à 100% de capacité, on ne peut pas loger tout le monde.
   */
  private selectOptimalRooms(
    rooms: Room[],
    totalStudentsNeeded: number,
  ): Room[] {
    const sortedRooms = [...rooms].sort(
      (a, b) => b.maxCapacity - a.maxCapacity,
    );

    const selectedRooms: Room[] = [];
    let currentComfortCapacity = 0;
    let currentRawCapacity = 0;

    for (const room of sortedRooms) {
      selectedRooms.push(room);

      currentComfortCapacity += Math.floor(
        room.maxCapacity * this.comfortRatio,
      );
      currentRawCapacity += room.maxCapacity;

      if (currentComfortCapacity >= totalStudentsNeeded) {
        return selectedRooms;
      }
    }

    if (currentRawCapacity < totalStudentsNeeded) {
      throw new Error(
        `Capacité insuffisante : requis ${totalStudentsNeeded}, disponible ${currentRawCapacity}`,
      );
    }

    return selectedRooms;
  }

  /**
   * Formate les données d'une salle avec le placement matriciel des étudiants.
   */
  private buildRoomReport<T extends Student>(
    room: Room,
    students: T[],
    columns: number,
  ): RoomReport<T> {
    const seatingPlan: OccupiedSeat<T>[] = students
      .map((student, index) => ({
        row: Math.floor(index / columns),
        column: index % columns,
        student,
      }))
      .sort((a, b) => a.student.name.localeCompare(b.student.name));

    const occupancyRate = students.length / room.maxCapacity;

    return {
      roomId: room.id,
      roomName: room.name,
      maxCapacity: room.maxCapacity,
      seatingPlan,
      studentCount: students.length,
      occupancyRate: Number(occupancyRate.toFixed(2)),
      isOverloaded: students.length > room.maxCapacity,
    };
  }
}
