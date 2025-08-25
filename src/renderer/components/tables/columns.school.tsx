import type { SchoolAttributes } from "@/commons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import React from "react";
import { Badge } from "@/renderer/components/ui/badge";
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { CheckCircle, MinusCircle } from "lucide-react";


const SchoolStatusBadge: React.FC<{ schoolId: string }> = ({ schoolId }) => {
    const currentActiveSchoolId = useApplicationConfigurationStore(store => store.currentSchool?.schoolId);
    const isActive = currentActiveSchoolId === schoolId;

    return (
        <Badge
            variant={isActive ? "default" : "secondary"}
            className="flex items-center gap-1 w-fit"
        >
            {isActive ? (
                <CheckCircle className="size-4" />
            ) : (
                <MinusCircle className="size-4" />
            )}
            <span>{isActive ? "Active" : "Inactive"}</span>
        </Badge>
    );
};
export const SchoolColumns: ColumnDef<SchoolAttributes>[] = [
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
                    aria-label="Sélectionner toutes les lignes"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Sélectionner la ligne"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "schoolId",
        header: "#ID",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.schoolId}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Nom",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.name}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "ville",
        header: "Ville",
        cell: ({ row }) => <TypographySmall>{row.original.town}</TypographySmall>
    },
    {
        accessorKey: "adress",
        header: "Adresse",
        cell: ({ row }) => <TypographySmall>{row.original.adress}</TypographySmall>,
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => (
            <SchoolStatusBadge schoolId={row.original.schoolId} />
        ),
    },
]