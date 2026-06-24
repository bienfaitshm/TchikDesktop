import { Student, Room, RoomReport, OccupiedSeat } from "./types";
import { Classroom, interleaveStudents } from "./interleave";
import { shuffleArray } from "./utils";

/**
 * Moteur d'optimisation pour la répartition des étudiants dans les salles d'examen.
 * Applique une stratégie d'entrelacement pour maximiser la distance entre étudiants
 * d'une même classe (anti-triche) et gère le taux d'occupation cible.
 */
export class ExamOptimizer {
  private readonly comfortRatio: number;

  /**
   * @param comfortRatio - Ratio d'occupation cible (ex: 0.8 pour 80%). Gère le confort et l'espace.
   */
  constructor(comfortRatio: number = 0.8) {
    this.comfortRatio = comfortRatio;
  }

  /**
   * Génère un plan de salle optimisé, uniformément réparti et anti-triche.
   * Remplit les salles de manière séquentielle (Round-Robin) en respectant d'abord le ratio de confort,
   * puis bascule sur la capacité maximale brute si nécessaire.
   * * @template T - Le type d'objet Étudiant, étendant l'interface de base Student.
   * @param students - Liste globale des étudiants à placer.
   * @param rooms - Liste des salles d'examen disponibles.
   * @param defaultColumnsPerRoom - Nombre de colonnes par défaut pour la disposition matricielle.
   * @returns Un tableau de rapports détaillés par salle, trié par nom de salle.
   * @throws {Error} Si la capacité totale brute de toutes les salles est insuffisante.
   */
  public generateSeatingPlan<T extends Student>(
    students: T[],
    rooms: Room[],
    defaultColumnsPerRoom: number = 5,
  ): RoomReport<T>[] {
    if (!students.length || !rooms.length) return [];

    const shuffledStudents = [...this.interleaveStudents(students)];
    const activeRooms = this.selectOptimalRooms(rooms, students.length);

    // Initialisation de la table d'allocation des étudiants par identifiant de salle
    const allocations = new Map<string, T[]>(
      activeRooms.map((room) => [room.id, []]),
    );

    let currentRoomIndex = 0;

    for (const student of shuffledStudents) {
      let isPlaced = false;

      // Passe 1 : Répartition sous le seuil du ratio de confort (stratégie optimale)
      for (let i = 0; i < activeRooms.length; i++) {
        const index = (currentRoomIndex + i) % activeRooms.length;
        const room = activeRooms[index];
        const currentAllocation = allocations.get(room.id)!;

        if (
          currentAllocation.length <
          Math.floor(room.maxCapacity * this.comfortRatio)
        ) {
          currentAllocation.push(student);
          currentRoomIndex = (index + 1) % activeRooms.length;
          isPlaced = true;
          break;
        }
      }

      // Passe 2 : Repli (Fallback) - Remplissage jusqu'à la capacité maximale brute si nécessaire
      if (!isPlaced) {
        for (let i = 0; i < activeRooms.length; i++) {
          const index = (currentRoomIndex + i) % activeRooms.length;
          const room = activeRooms[index];
          const currentAllocation = allocations.get(room.id)!;

          if (currentAllocation.length < room.maxCapacity) {
            currentAllocation.push(student);
            currentRoomIndex = (index + 1) % activeRooms.length;
            isPlaced = true;
            break;
          }
        }
      }
    }

    // Génération et formatage des rapports finaux
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
   * Regroupe les étudiants sous forme de dictionnaire indexé par l'identifiant de leur classe.
   */
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
   * Mélange aléatoirement les étudiants au sein de leurs classes respectives,
   * puis applique l'algorithme d'entrelacement pour éviter la proximité directe de camarades.
   */
  private interleaveStudents<T extends Student>(students: T[]): T[] {
    if (students.length === 0) return [];

    const groups = this.groupStudentByClass(students);

    const classroomLists: Classroom<T>[] = Object.entries(groups).map(
      ([name, classStudents]) => ({
        name,
        students: shuffleArray([...classStudents]),
      }),
    );

    return interleaveStudents<T>(classroomLists);
  }

  /**
   * Sélectionne le sous-ensemble minimal de salles nécessaires pour accueillir tout le monde.
   * Trie par capacité décroissante pour optimiser l'occupation et minimiser le besoin en surveillants.
   * * @throws {Error} Si la capacité brute cumulée est inférieure au nombre d'étudiants.
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

    // Si le mode confort ne suffit pas, on vérifie si ça passe en mode brut (100% de capacité)
    if (currentRawCapacity < totalStudentsNeeded) {
      throw new Error(
        `Capacité totale insuffisante : requis ${totalStudentsNeeded}, disponible maximale ${currentRawCapacity}`,
      );
    }

    return selectedRooms;
  }

  /**
   * Construit le rapport final d'une salle en plaçant les étudiants sous forme de matrice (lignes/colonnes).
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
