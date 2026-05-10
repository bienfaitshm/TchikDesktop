import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

// --- Types ---

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
  classId: string;
  classroom: Classroom;
}

export interface Seating {
  column: number;
  row: number;
  student: Student | null;
}

export interface RoomState {
  roomId: string;
  roomName: string;
  seatingPlan: Seating[];
  studentCount: number;
}

export type StudentSeating = {
  fullName: string;
  identifier: string;
  classroomId: string;
  row: number;
  column: number;
};

// --- Interface du Store ---
interface GlobalRoomStore {
  rooms: Record<string, RoomState>;
  sessionId: string;

  // Actions
  initStore: (rooms: RoomState[], sessionId: string) => void;
  removeStudent: (studentId: string) => void;
  moveStudent: (
    studentId: string,
    sourceRoomId: string,
    targetRoomId: string,
    targetRow: number,
    targetCol: number,
  ) => void;
}

// --- Store Global ---
export const useGlobalRoomStore = create<GlobalRoomStore>((set) => ({
  rooms: {},
  sessionId: "",

  initStore: (rooms, sessionId) => {
    const roomsMap = rooms.reduce(
      (acc, room) => {
        acc[room.roomId] = room;
        return acc;
      },
      {} as Record<string, RoomState>,
    );
    set({ rooms: roomsMap, sessionId });
  },

  removeStudent: (studentId) =>
    set((state) => {
      const newRooms = { ...state.rooms };

      Object.keys(newRooms).forEach((roomId) => {
        const room = newRooms[roomId];
        // On vérifie si l'étudiant est présent dans cette salle
        const hasStudent = room.seatingPlan.some(
          (s) => s.student?.id === studentId,
        );

        if (hasStudent) {
          const updatedPlan = room.seatingPlan.map((s) =>
            s.student?.id === studentId ? { ...s, student: null } : s,
          );

          newRooms[roomId] = {
            ...room,
            seatingPlan: updatedPlan,
            studentCount: updatedPlan.filter((s) => s.student !== null).length,
          };
        }
      });

      return { rooms: newRooms };
    }),

  moveStudent: (studentId, sourceRoomId, targetRoomId, targetRow, targetCol) =>
    set((state) => {
      const sourceRoom = state.rooms[sourceRoomId];
      const targetRoom = state.rooms[targetRoomId];

      if (!sourceRoom || !targetRoom) return state;

      // 1. Trouver le siège source
      const sourceSeat = sourceRoom.seatingPlan.find(
        (s) => s.student?.id === studentId,
      );
      if (!sourceSeat || !sourceSeat.student) return state;

      const movingStudent = sourceSeat.student;

      // 2. Trouver l'étudiant à la destination (pour le swap)
      const targetSeat = targetRoom.seatingPlan.find(
        (s) => s.row === targetRow && s.column === targetCol,
      );
      const studentToSwap = targetSeat?.student || null;

      const newRooms = { ...state.rooms };

      // --- CAS A : Mouvement dans la MÊME salle ---
      if (sourceRoomId === targetRoomId) {
        const updatedPlan = sourceRoom.seatingPlan.map((s) => {
          // La cible reçoit l'étudiant déplacé
          if (s.row === targetRow && s.column === targetCol) {
            return { ...s, student: movingStudent };
          }
          // L'ancienne place reçoit l'étudiant qui était à la cible (Swap)
          if (s.row === sourceSeat.row && s.column === sourceSeat.column) {
            return { ...s, student: studentToSwap };
          }
          return s;
        });

        newRooms[sourceRoomId] = {
          ...sourceRoom,
          seatingPlan: updatedPlan,
          // Le count ne change pas en mouvement interne
        };
      }
      // --- CAS B : Mouvement entre DEUX salles différentes ---
      else {
        // La salle source perd l'étudiant mais récupère celui de la cible (Swap inter-salle)
        const updatedSourcePlan = sourceRoom.seatingPlan.map((s) =>
          s.row === sourceSeat.row && s.column === sourceSeat.column
            ? { ...s, student: studentToSwap }
            : s,
        );

        // La salle cible reçoit l'étudiant déplacé
        const updatedTargetPlan = targetRoom.seatingPlan.map((s) =>
          s.row === targetRow && s.column === targetCol
            ? { ...s, student: movingStudent }
            : s,
        );

        newRooms[sourceRoomId] = {
          ...sourceRoom,
          seatingPlan: updatedSourcePlan,
          studentCount: updatedSourcePlan.filter((s) => s.student !== null)
            .length,
        };

        newRooms[targetRoomId] = {
          ...targetRoom,
          seatingPlan: updatedTargetPlan,
          studentCount: updatedTargetPlan.filter((s) => s.student !== null)
            .length,
        };
      }

      return { rooms: newRooms };
    }),
}));

// --- Sélecteurs ---

/**
 * Hook optimisé pour l'export des données.
 * Utilise useShallow pour éviter les re-renders inutiles si les données
 * calculées n'ont pas changé structurellement.
 */
export const useAllCleanSeatingData = () => {
  return useGlobalRoomStore(
    useShallow((state) => {
      return Object.values(state.rooms).flatMap((room) =>
        room.seatingPlan
          .filter((s) => s.student !== null)
          .map((s) => ({
            localRoomId: room.roomId,
            enrolementId: s.student!.id,
            sessionId: state.sessionId,
            rowPosition: s.row,
            columnPosition: s.column,
          })),
      );
    }),
  );
};

export const mapSeatingToStudentList = (
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
      row: seat.row,
      column: seat.column,
    }));
};
