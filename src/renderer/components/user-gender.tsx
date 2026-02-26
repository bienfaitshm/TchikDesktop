import React from 'react';
import { Mars, Venus } from 'lucide-react';
import { Badge } from '@/renderer/components/ui/badge';
import { cn } from '@/renderer/utils';

import {
    USER_GENDER,
    USER_GENDER_TRANSLATIONS,
} from "@/commons/constants/enum";


const GenderIcon = React.memo(({ gender }: { gender: USER_GENDER }) => {
    const IconComponent = gender === USER_GENDER.MALE ? Mars : Venus;
    return <IconComponent className="size-4" />;
});

interface GenderBadgeProps {
    gender: USER_GENDER;
    withIcon?: boolean;
}

export const GenderBadge = React.memo(
    ({ gender, withIcon = true }: GenderBadgeProps) => {
        const isMale = gender === USER_GENDER.MALE;
        const variantClass = isMale ? 'bg-blue-500 hover:bg-blue-500/80' : 'bg-pink-500 hover:bg-pink-500/80';

        return (
            <Badge className={cn('gap-1', variantClass)}>
                {withIcon && <GenderIcon gender={gender} />}
                <span>{USER_GENDER_TRANSLATIONS[gender]}</span>
            </Badge>
        );
    }
);