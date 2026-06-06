import type {
  TSeatingSessionGrouped,
  TAssignment,
} from "@/packages/@core/data-access/db/queries/seating-queries";
import type {
  TSchool,
  TStudyYear,
} from "@/packages/@core/data-access/db/schemas/types";

export type Student = TAssignment;

export interface School extends TSchool {
  studyYear: TStudyYear;
}

export interface SeatingReportPayload {
  school: School;
  assignment: TSeatingSessionGrouped;
}
