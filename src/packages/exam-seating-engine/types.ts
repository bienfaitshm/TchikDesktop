export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface Room {
  id: string;
  name: string;
  maxCapacity: number;
  columns?: number; 
}

export interface OccupiedSeat<T> {
  row: number;
  column: number;
  student: Student & T;
}

export interface RoomReport<T> {
  roomId: string;
  roomName: string;
  maxCapacity:number;
  seatingPlan: OccupiedSeat<T>[];
  occupancyRate: number;
  isOverloaded: boolean;
  studentCount: number;
}