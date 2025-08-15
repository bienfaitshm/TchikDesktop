import type { TEnrolement, TWithUser } from "@/commons/types/models";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { GenderBadge } from "../user-gender";
import { StudentStatusBadge } from "../student-status";

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
        header: "Nom, postnom et prénom",
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
        cell: ({ row }) => <GenderBadge withIcon gender={row.original.User.gender} />
    },
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <TypographySmall>{row.original.code}</TypographySmall>,
    },
    {
        accessorKey: "section",
        header: "Status",
        cell: ({ row }) => <StudentStatusBadge status={row.original.status} />
    },
];