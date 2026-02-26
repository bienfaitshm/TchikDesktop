import type { TEnrolement, TWithUser } from "@/commons/types/services"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { Checkbox } from "@/renderer/components/ui/checkbox"
import { format } from "date-fns" // Ajout d'une librairie pour formater les dates

// Type pour les données de la table
type EnrollmentData = TWithUser<TEnrolement>

/**
 * Définit les colonnes pour le tableau d'historique des inscriptions.
 * Utilise des conventions de nommage claires et des composants réutilisables.
 */
export const EnrollmentHistoricsColumns: ColumnDef<EnrollmentData>[] = [
    // ------------------------------------
    // Colonne de sélection (Checkbox)
    // ------------------------------------
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
                    aria-label="Sélectionner tout"
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

    // ------------------------------------
    // Colonne Nom Complet
    // ------------------------------------
    {
        accessorKey: "User.fullname", // Utilisation de la clé d'accès imbriquée
        header: "Nom, Postnom et Prénom",
        cell: ({ row }) => (
            <TypographySmall className="font-medium text-foreground">
                {row.original.User.fullname}
            </TypographySmall>
        ),
        enableSorting: true,
        enableHiding: false, // Garder ce champ toujours visible
        enableColumnFilter: true, // Laissez la possibilité de filtrer
    },

    // ------------------------------------
    // Colonne Classe (via classroomId)
    // ------------------------------------
    {
        accessorKey: "classroomId",
        header: "Classe",
        cell: ({ row }) => (
            <TypographySmall className="text-sm font-mono text-muted-foreground">
                {row.original.classroomId}
            </TypographySmall>
        ),
        enableSorting: true,
        enableHiding: true,
        enableColumnFilter: true,
    },

    // ------------------------------------
    // Colonne Code d'inscription
    // ------------------------------------
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
            <TypographySmall className="font-bold text-primary">
                {row.original.code}
            </TypographySmall>
        ),
        enableSorting: true,
        enableHiding: true,
        enableColumnFilter: true,
    },

    // ------------------------------------
    // Colonne Date d'inscription
    // ------------------------------------
    {
        accessorKey: "createdAt", // Assumer que la date est dans `createdAt` ou une clé similaire
        header: "Date d'Inscription",
        cell: ({ row }: any) => {
            // Assumer que 'createdAt' est une chaîne de date valide (ex: ISO string)
            const date = new Date(row.original.createdAt)

            return (
                <TypographySmall className="text-xs text-muted-foreground">
                    {/* Formater la date en jj/MM/aaaa (ou autre format souhaité) */}
                    {format(date, 'dd/MM/yyyy')}
                </TypographySmall>
            )
        },
        enableSorting: true,
        enableHiding: true,
        enableColumnFilter: false, // Souvent complexe de filtrer sur une date formatée
    },
]