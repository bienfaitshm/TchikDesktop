import { Badge } from '@/renderer/components/ui/badge';
import { STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS } from '@/commons/constants/enum';

interface StudentStatusBadgeProps {
    status: STUDENT_STATUS;
}

const statusVariantMap = {
    [STUDENT_STATUS.EN_COURS]: 'default',
    [STUDENT_STATUS.ABANDON]: 'destructive',
    [STUDENT_STATUS.EXCLUT]: 'destructive',
};

export const StudentStatusBadge = ({ status }: StudentStatusBadgeProps) => {
    const variant = statusVariantMap[status] as 'default' | 'destructive' | 'secondary';

    return (
        <Badge variant={variant}>
            {STUDENT_STATUS_TRANSLATIONS[status]}
        </Badge>
    );
};