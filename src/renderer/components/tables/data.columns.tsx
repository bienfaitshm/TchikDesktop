import { useSortable } from "@dnd-kit/sortable";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { Button } from "@/renderer/components/ui/button";
import {
  EllipsisVertical,
  CircleCheck,
  GripVertical,
  Loader,
} from "lucide-react";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { Badge } from "@/renderer/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import type { UniqueIdentifier } from "@dnd-kit/core";

export const dataRowSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

export type DataRow = z.infer<typeof dataRowSchema>;

/**
 * Renders a drag handle button for reordering rows.
 * @param props - Object containing the unique identifier of the row.
 * @returns The drag handle button component.
 */
function DragHandle({ id }: { id: UniqueIdentifier }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Glisser pour réorganiser</span>
    </Button>
  );
}

export const DATA_COLUMNS: ColumnDef<DataRow>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
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
          aria-label="Tout sélectionner"
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
    accessorKey: "header",
    header: "En-tête",
    cell: ({ row }) => <TypographySmall>{row.original.header}</TypographySmall>,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type de section",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Done" ? (
          <CircleCheck className="fill-green-500 dark:fill-green-400" />
        ) : (
          <Loader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Cible</div>,
    cell: ({ row }) => <TypographySmall>{row.original.target}</TypographySmall>,
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Limite</div>,
    cell: ({ row }) => <TypographySmall>{row.original.limit}</TypographySmall>,
  },
  {
    accessorKey: "reviewer",
    header: "Réviseur",
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Assign reviewer";
      return isAssigned ? (
        row.original.reviewer
      ) : (
        <TypographySmall>{row.original.reviewer}</TypographySmall>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <EllipsisVertical />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => console.log("Click item")}>
            Éditer
          </DropdownMenuItem>
          <DropdownMenuItem>Créer une copie</DropdownMenuItem>
          <DropdownMenuItem>Favoris</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
