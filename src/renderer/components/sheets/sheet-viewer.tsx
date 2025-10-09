import React, { useCallback, useRef, useState, useImperativeHandle, type ReactNode } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/renderer/components/ui/sheet";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Suspense } from "@/renderer/libs/queries/suspense";



export type DefaultDataSheetViewerValue = unknown;

/**
 * État interne du composant DataSheetViewer.
 * @template TValue Le type des données à afficher.
 * @property {boolean} open - Indique si le panneau latéral (Sheet) est ouvert.
 * @property {TValue | undefined} value - La donnée à afficher dans le panneau latéral.
 */
type DataSheetViewerState<TValue> = {
    open: boolean;
    value?: TValue;
};

/**
 * Propriétés du composant DataSheetViewer.
 * @template TValue Le type des données à afficher.
 * @property {(value: TValue) => ReactNode} children - Fonction de rendu qui reçoit la valeur typée à afficher et retourne le contenu.
 * @property {string} [title] - Titre par défaut du panneau latéral.
 * @property {string} [description] - Description par défaut du panneau latéral.
 */
type DataSheetViewerProps<TValue> = {
    children: (value: TValue) => ReactNode;
    title?: string;
    description?: string;
};

/**
 * Référence impérative exposée par le composant DataSheetViewer.
 * @template TValue Le type des données à afficher.
 * @property {(value: TValue) => void} showDetails - Ouvre le panneau latéral avec la donnée spécifiée.
 */
export type DataSheetViewerRef<TValue> = {
    showDetails(value: TValue): void;
};

// --- Composant principal ---

/**
 * DataSheetViewer est un composant générique qui affiche des détails dans un panneau latéral (Sheet)
 * et expose une API impérative via `forwardRef` pour contrôler son affichage.
 *
 * @component
 * @template TValue Le type spécifique des données que ce visualiseur doit traiter (ex: `Student`, `Product`).
 * @example
 * ```tsx
 * type Student = { id: number, name: string };
 *
 * // Dans le composant parent
 * const { sheetRef, showDetails } = useDataSheetViewer<Student>();
 *
 * <DataSheetViewer<Student> ref={sheetRef} title="Détails de l'Étudiant">
 * {(student) => <div>Nom: {student.name}</div>}
 * </DataSheetViewer>
 *
 * // Pour ouvrir
 * showDetails({ id: 1, name: "Alice" }); // TypeScript vérifie le type ici!
 * ```
 */
export const DataSheetViewer = React.forwardRef((
    {
        children,
        title = "Détails de l'élément",
        description = "Informations complètes concernant l'élément sélectionné."
    }: DataSheetViewerProps<DefaultDataSheetViewerValue>,
    ref: React.Ref<DataSheetViewerRef<DefaultDataSheetViewerValue>>
) => {
    const [state, setState] = useState<DataSheetViewerState<DefaultDataSheetViewerValue>>({
        open: false,
        value: undefined,
    });

    const handleClose = useCallback(
        () => setState({ open: false, value: undefined }),
        []
    );

    const handleOpen = useCallback((value: DefaultDataSheetViewerValue) => {
        setState({ value, open: true });
    }, []);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                handleClose();
            }
        },
        [handleClose]
    );

    useImperativeHandle(
        ref,
        () => ({
            showDetails: (value: DefaultDataSheetViewerValue) => {
                handleOpen(value);
            },
        }),
        [handleOpen]
    );

    return (
        <Sheet modal={false} open={state.open} onOpenChange={handleOpenChange}>
            <SheetContent className="sm:max-w-xl p-0">
                <ScrollArea className="h-full">
                    <SheetHeader className="p-6 space-y-1">
                        <SheetTitle>{title}</SheetTitle>
                        <SheetDescription className="text-xs">
                            {description}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="p-6 mb-10">
                        {state.value !== undefined && (
                            <Suspense>
                                <>{children(state.value)}</>
                            </Suspense>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
) as (<TValue = DefaultDataSheetViewerValue>(
    props: DataSheetViewerProps<TValue> & { ref?: React.Ref<DataSheetViewerRef<TValue>> }
) => React.ReactElement);



/**
 * Hook personnalisé générique pour utiliser le composant DataSheetViewer de manière idiomatique.
 *
 * @template TValue Le type des données que le visualiseur gérera.
 * @returns {{sheetRef: React.RefObject<DataSheetViewerRef<TValue>>, showDetails: (value: TValue) => void}}
 * @example
 * ```tsx
 * const { sheetRef, showDetails } = useDataSheetViewer<{ name: string }>();
 * // ...
 * <button onClick={() => showDetails({ name: 'Bob' })}>Voir Détails</button>
 * ```
 */

export function useDataSheetViewer<TValue = DefaultDataSheetViewerValue>() {
    const sheetRef = useRef<DataSheetViewerRef<TValue>>(null);

    const showDetails = useCallback((value: TValue) => {
        sheetRef.current?.showDetails(value);
    }, []);

    return { sheetRef, showDetails };
}