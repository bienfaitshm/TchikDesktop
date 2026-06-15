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

  private groupStudentByClass<T extends Student>(
    students: T[],
  ): Record<string, T[]> {
    const groups: Record<string, T[]> = {};
    for (const student of students) {
      if (!groups[student.classId]) {
        groups[student.classId] = [];
      }
      groups[student.classId].push(student);
    }
    return groups;
  }

  /**
   * Groupe, mélange aléatoirement et entrelace les étudiants pour maximiser
   * la distance physique entre les membres d'une même classe.
   * * @param students - Liste globale des étudiants.
   * @returns Une liste linéaire d'étudiants entrelacés.
   */
  private interleaveStudents<T extends Student>(students: T[]): T[] {
    if (students.length === 0) return [];

    // 1. Groupement des étudiants par classe
    const groups: Record<string, T[]> = this.groupStudentByClass(students);

    // 2. Mélange initial de chaque classe (Copie pour éviter les mutations)
    const classLists: T[][] = Object.values(groups).map((group) =>
      shuffleArray([...group]),
    );

    const result: T[] = [];

    // 3. Entrelacement dynamique en utilisant des files
    // On boucle tant qu'il reste des listes de classes non vides
    while (classLists.length > 0) {
      // Optionnel : On peut mélanger classLists ici si on veut que l'ordre des classes change à chaque round

      for (let i = classLists.length - 1; i >= 0; i--) {
        const currentClass = classLists[i];

        // On prend le premier étudiant de la classe (O(1) conceptuel ici, ou .pop() pour du vrai O(1))
        const student = currentClass.shift();
        if (student) {
          result.push(student);
        }

        // Si la classe est vide, on la supprime pour ne plus boucler dessus au prochain tour
        if (currentClass.length === 0) {
          classLists.splice(i, 1);
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
