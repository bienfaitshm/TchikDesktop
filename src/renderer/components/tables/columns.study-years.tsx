import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import React from "react";
import { Badge } from "@/renderer/components/ui/badge";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { CheckCircle, MinusCircle } from "lucide-react";
import { formatDate } from "@/packages/times";
import type { TStudyYearAttributes as TStudyYear } from "@/packages/@core/data-access/schema-validations/types"
import { DataTableColumnHeader } from "./data-table.column-header";

/**
 * Composant de badge affichant le statut d'activation d'une année d'étude.
 * Indique si l'année passée est l'année d'étude active configurée.
 */
const StudyYearStatusBadge: React.FC<{ yearId: string }> = ({ yearId }) => {
    const { yearId: currentActiveYearId } = useCurrentConfig()
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

export const StudyYearColumns: ColumnDef<TStudyYear>[] = [
    {
        accessorKey: "yearName",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom de l'année scolaire" />
        ),
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