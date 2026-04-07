import { useMemo, useCallback, useReducer } from "react";

// --- Types ---
export interface Student {
  id: string; // enrolementId
  name: string;
  classId: string;
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

// Format de sortie "Clean"
export interface CleanSeatingData {
  localRoomId: string;
  enrolementId: string;
  sessionId: string;
  rowPosition: number;
  columnPosition: number;
}

// --- Reducer pour la performance ---
type RoomAction =
  | {
      type: "TRANSFER_STUDENT";
      studentId: string;
      targetRow: number;
      targetCol: number;
    }
  | { type: "REMOVE_STUDENT"; studentId: string }
  | { type: "ADD_STUDENT"; student: Student; row: number; col: number };

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case "ADD_STUDENT": {
      // Vérifier si la place est déjà prise
      const isOccupied = state.seatingPlan.some(
        (s) =>
          s.row === action.row && s.column === action.col && s.student !== null,
      );
      if (isOccupied) return state; // On pourrait aussi retourner une erreur ici

      return {
        ...state,
        studentCount: state.studentCount + 1,
        seatingPlan: state.seatingPlan.map((s) =>
          s.row === action.row && s.column === action.col
            ? { ...s, student: action.student }
            : s,
        ),
      };
    }

    case "REMOVE_STUDENT":
      return {
        ...state,
        studentCount: Math.max(0, state.studentCount - 1),
        seatingPlan: state.seatingPlan.map((s) =>
          s.student?.id === action.studentId ? { ...s, student: null } : s,
        ),
      };

    case "TRANSFER_STUDENT": {
      const { studentId, targetRow, targetCol } = action;

      // 1. Trouver l'étudiant source et l'éventuel occupant de la cible
      const sourceSeat = state.seatingPlan.find(
        (s) => s.student?.id === studentId,
      );
      const targetSeat = state.seatingPlan.find(
        (s) => s.row === targetRow && s.column === targetCol,
      );

      if (!sourceSeat || !targetSeat) return state;

      const studentToMove = sourceSeat.student;
      const studentToSwap = targetSeat.student; // Peut être null

      return {
        ...state,
        seatingPlan: state.seatingPlan.map((s) => {
          // La place d'origine reçoit soit l'étudiant délogé (swap), soit devient vide
          if (s.row === sourceSeat.row && s.column === sourceSeat.column) {
            return { ...s, student: studentToSwap };
          }
          // La place cible reçoit l'étudiant déplacé
          if (s.row === targetRow && s.column === targetCol) {
            return { ...s, student: studentToMove };
          }
          return s;
        }),
      };
    }

    default:
      return state;
  }
}

export const useRoomManagement = (
  initialData: RoomState,
  sessionId: string,
) => {
  const [state, dispatch] = useReducer(roomReducer, initialData);

  // 1. Actions stables (ne provoquent pas de re-render des composants mémoïsés)
  const removeStudent = useCallback((studentId: string) => {
    dispatch({ type: "REMOVE_STUDENT", studentId });
  }, []);

  const transferStudent = useCallback(
    (studentId: string, targetRow: number, targetCol: number) => {
      dispatch({ type: "TRANSFER_STUDENT", studentId, targetRow, targetCol });
    },
    [],
  );

  const addStudent = useCallback(
    (student: Student, row: number, col: number) => {
      dispatch({ type: "ADD_STUDENT", student, row, col });
    },
    [],
  );

  // 2. Séparation de la donnée brute et de la donnée "Clean"
  // On utilise useMemo pour ne recalculer le format exportable QUE si le plan de table change
  const cleanData = useMemo(() => {
    return state.seatingPlan
      .filter(
        (seat): seat is Seating & { student: Student } => seat.student !== null,
      )
      .map((seat) => ({
        localRoomId: state.roomId,
        enrolementId: seat.student.id, // Ici TS sait que student n'est pas null
        sessionId,
        rowPosition: seat.row,
        columnPosition: seat.column,
      }));
  }, [state.seatingPlan, state.roomId, sessionId]);

  return {
    state,
    cleanData,
    actions: {
      removeStudent,
      transferStudent,
      addStudent,
    },
  };
};
