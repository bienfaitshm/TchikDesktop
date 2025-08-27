import type { StudyYearAttributes } from "@/commons/types/models";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import React from "react";
import { Badge } from "@/renderer/components/ui/badge";
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { CheckCircle, MinusCircle } from "lucide-react";
import { formatDate } from "@/commons/libs/times";


/**
 * Composant de badge affichant le statut d'activation d'une année d'étude.
 * Indique si l'année passée est l'année d'étude active configurée.
 */
const StudyYearStatusBadge: React.FC<{ yearId: string }> = ({ yearId }) => {
    const currentActiveYearId = useApplicationConfigurationStore(store => store.currentStudyYear?.yearId);
    const isActive = currentActiveYearId === yearId;

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

export const StudyYearColumns: ColumnDef<StudyYearAttributes>[] = [
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
        accessorKey: "yearId",
        header: "#ID",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.yearId}</TypographySmall>;
        },
        enableHiding: false,
    },
    {
        accessorKey: "yearName",
        header: "Nom de l'année scolaire",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.yearName}</TypographySmall>;
        },
        enableHiding: false,
    },
    {
        accessorKey: "startDate",
        header: "Date de début",
        cell: ({ row }) => (
            <TypographySmall>{formatDate(row.original.startDate)}</TypographySmall>
        ),
    },
    {
        accessorKey: "endDate",
        header: "Date de fin",
        cell: ({ row }) => (
            <TypographySmall>{formatDate(row.original.endDate)}</TypographySmall>
        ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => (
            <StudyYearStatusBadge yearId={row.original.yearId} />
        ),
    },
];