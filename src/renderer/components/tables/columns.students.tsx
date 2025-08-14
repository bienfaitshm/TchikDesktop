import type { TEnrolement, TWithUser } from "@/commons/types/models";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { Badge } from "@/renderer/components/ui/badge";
import {
    USER_GENDER,
    USER_GENDER_TRANSLATIONS,
    STUDENT_STATUS_TRANSLATIONS,
    STUDENT_STATUS,
} from "@/commons/constants/enum";
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Mars, Venus } from "lucide-react";

export const StudentColumns: ColumnDef<TWithUser<TEnrolement>>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "fullname",
        header: "Nom, postnom et prenom",
        cell: ({ row }) => {
            const fullname = row.original.User.fullname;
            return (
                <div className="flex flex-row gap-2">
                    <Avatar>
                        <AvatarFallback>{fullname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <TypographySmall className="text-sm text-black dark:text-white">
                            {fullname}
                        </TypographySmall>
                        <TypographySmall className="text-xs text-muted-foreground block">
                            {row.original.isNewStudent ? "Nouveau" : "Ancien"}
                        </TypographySmall>
                    </div>
                </div>
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: "sexe",
        header: "Sexe",
        cell: ({ row }) => {
            const isMale = row.original.User.gender === USER_GENDER.MALE;
            return (
                <Badge variant={isMale ? "secondary" : "outline"} className="px-2 ">
                    {isMale ? <Mars className="size-4" /> : <Venus className="size-4" />}
                    <span className="ml-2">
                        {USER_GENDER_TRANSLATIONS[row.original.User.gender]}
                    </span>
                </Badge>
            );
        },
    },
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <TypographySmall>{row.original.code}</TypographySmall>,
    },
    {
        accessorKey: "section",
        header: "Status",
        cell: ({ row }) => (
            <div>
                <Badge
                    variant={
                        row.original.status === STUDENT_STATUS.EN_COURS ? "default" : "destructive"
                    }
                    className="px-2"
                >
                    {STUDENT_STATUS_TRANSLATIONS[row.original.status]}
                </Badge>
            </div>
        ),
    },
];