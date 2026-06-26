import { Badge } from "@/renderer/components/ui/badge";
import { getStudentStatusLabel } from "@/packages/@core/data-access/db/options";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db/enum";

interface StudentStatusBadgeProps {
  status: STUDENT_STATUS_ENUM;
}

const statusVariantMap = {
  [STUDENT_STATUS_ENUM.ACTIVE]: "default",
  [STUDENT_STATUS_ENUM.EXPELLED]: "destructive",
  [STUDENT_STATUS_ENUM.DROPOUT]: "destructive",
};

export const StudentStatusBadge = ({ status }: StudentStatusBadgeProps) => {
  const variant = statusVariantMap[status] as
    | "default"
    | "destructive"
    | "secondary";

  return <Badge variant={variant}>{getStudentStatusLabel(status)}</Badge>;
};
