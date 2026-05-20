import React from 'react';
import { Mars, Venus } from 'lucide-react';
import { Badge } from '@/renderer/components/ui/badge';
import { cn } from '@/renderer/utils';

import {
    getGenderLabel
} from "@/packages/@core/data-access/db/options";
import { USER_GENDER_ENUM } from '@/packages/@core/data-access/db/enum';


const GenderIcon = React.memo(({ gender }: { gender: USER_GENDER_ENUM }) => {
    const IconComponent = gender === USER_GENDER_ENUM.MALE ? Mars : Venus;
    return <IconComponent className="size-4" />;
});

interface GenderBadgeProps {
    gender: USER_GENDER_ENUM;
    withIcon?: boolean;
}

export const GenderBadge = React.memo(
    ({ gender, withIcon = true }: GenderBadgeProps) => {
        const isMale = gender === USER_GENDER_ENUM.MALE;
        const variantClass = isMale ? 'bg-blue-500 hover:bg-blue-500/80' : 'bg-pink-500 hover:bg-pink-500/80';

        return (
            <Badge className={cn('gap-1', variantClass)}>
                {withIcon && <GenderIcon gender={gender} />}
                <span>{getGenderLabel(gender)}</span>
            </Badge>
        );
    }
);