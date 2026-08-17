import { User, FeeAssignment } from "@/packages/@core/data-access/db/schemas";

export type AssignmentTableOfClassroom = {
  enrollmentId: string;
  student: User;
  payments: { [scheduleId: string]: FeeAssignment | null };
};

export type TableClassroomPaymentAssignment = {
  feeTypeId: string;
  name: string;
  table: {
    head: { id: string; name: string }[];
    body: AssignmentTableOfClassroom[];
  };
};

export type OnSyncMessageParams = { message: string; pourcent: number };
export type OnSyncMessage = (context: OnSyncMessageParams) => void;
