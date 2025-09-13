import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
// Assurez-vous que ces imports sont corrects dans votre projet
import { ButtonLoader } from "../form/button-loader";
import { MUTATION_ACTION } from "@/commons/constants/enum";
import { FormSubmitter } from "../form/form-submiter"; // Supposons que FormSubmitter est un client-side wrapper pour un formulaire

// --- Helpers pour les textes des dialogues ---
type DialogTextDescription = {
    title: string;
    description: string;
    submitText?: string; // submitText est optionnel pour le dialogue de suppression
};

// Mappage des informations textuelles pour les dialogues
const DIALOG_TEXT_INFOS: Record<MUTATION_ACTION, (itemName: string) => DialogTextDescription> = {
    [MUTATION_ACTION.CREATE]: (itemName: string) => ({
        title: `Création du/de la ${itemName}`,
        description: `Remplissez les informations ci-dessous pour créer un nouveau/une nouvelle ${itemName}.`,
        submitText: "Enregistrer",
    }),
    [MUTATION_ACTION.EDIT]: (itemName: string) => ({
        title: `Modification du/de la ${itemName}`,
        description: `Modifiez les informations du/de la ${itemName} sélectionné(e).`,
        submitText: "Modifier",
    }),
    [MUTATION_ACTION.DELETE]: (itemName: string) => ({
        title: `Suppression du/de la ${itemName}`,
        description: `Êtes-vous sûr(e) de vouloir supprimer cet(te) ${itemName}? Cette action est irréversible.`,
        submitText: "Confirmer", // Bien que non utilisé directement, c'est pour la cohérence
    }),
};

// Fonction utilitaire pour obtenir les infos du dialogue
function getDialogTextInfos(itemName: string, key: MUTATION_ACTION): DialogTextDescription {
    return DIALOG_TEXT_INFOS[key](itemName);
}

// --- Types de base pour l'état du dialogue et les props ---
type DialogActionState<TItem> = {
    isOpen: boolean;
    type: MUTATION_ACTION;
    initialData?: TItem; // Typage générique pour les données initiales
};

// --- Hook pour gérer l'état du dialogue ---
function useActionDialog<TItem>() {
    const [dialogState, setDialogState] = useState<DialogActionState<TItem>>({
        isOpen: false,
        type: MUTATION_ACTION.CREATE, // Valeur par défaut
    });

    const openCreate = useCallback(() => {
        setDialogState({ isOpen: true, type: MUTATION_ACTION.CREATE, initialData: undefined });
    }, []);

    const openUpdate = useCallback((item: TItem) => {
        setDialogState({ isOpen: true, type: MUTATION_ACTION.EDIT, initialData: item });
    }, []);

    const openDelete = useCallback((item: TItem) => {
        setDialogState({ isOpen: true, type: MUTATION_ACTION.DELETE, initialData: item });
    }, []);

    const closeDialog = useCallback(() => {
        setDialogState({ isOpen: false, type: MUTATION_ACTION.CREATE, initialData: undefined });
    }, []);

    return {
        dialogState,
        openCreate,
        openUpdate,
        openDelete,
        closeDialog,
    };
}

// --- Composant spécifique pour la confirmation de suppression ---
interface DeleteConfirmationDialogProps<TItem> {
    itemName: string;
    isLoading?: boolean;
    onConfirmDelete: (item: TItem) => void;
    itemToDelete?: TItem;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function DeleteConfirmationDialog<TItem>({
    itemName,
    isLoading,
    onConfirmDelete,
    itemToDelete,
    isOpen,
    onOpenChange,
}: DeleteConfirmationDialogProps<TItem>) {
    const dialogInfos = getDialogTextInfos(itemName, MUTATION_ACTION.DELETE);

    const handleConfirm = useCallback(() => {
        if (itemToDelete) {
            onConfirmDelete(itemToDelete);
        }
    }, [itemToDelete, onConfirmDelete]);
    return (
        <Dialog
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-center md:text-center">{dialogInfos.title}</DialogTitle>
                    <DialogDescription className="text-center md:text-center">{dialogInfos.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 p-4">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isLoading}>
                            Annuler
                        </Button>
                    </DialogClose>
                    <ButtonLoader
                        onClick={handleConfirm}
                        variant="destructive"
                        isLoading={isLoading}
                        disabled={isLoading}
                        isLoadingText="Suppression..."
                    >
                        Confirmer
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Composant spécifique pour les dialogues de formulaire (Création/Édition) ---
interface FormActionDialogProps {
    itemName: string;
    isLoading?: boolean;
    type: MUTATION_ACTION.CREATE | MUTATION_ACTION.EDIT;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode; // Contenu du formulaire passé en enfants
}

function FormActionDialog({
    itemName,
    isLoading,
    type,
    isOpen,
    onOpenChange,
    children,
}: FormActionDialogProps) {
    const dialogInfos = getDialogTextInfos(itemName, type);
    return (
        <Dialog
            modal={true}
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <FormSubmitter>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center md:text-left">{dialogInfos.title}</DialogTitle>
                        <DialogDescription className="text-center md:text-left">{dialogInfos.description}</DialogDescription>
                    </DialogHeader>
                    <FormSubmitter.Wrapper>
                        {children}
                    </FormSubmitter.Wrapper>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={isLoading}>
                                Annuler
                            </Button>
                        </DialogClose>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader
                                size="sm"
                                isLoading={isLoading}
                                disabled={isLoading}
                                isLoadingText="Enregistrement..."
                            >
                                {dialogInfos.submitText}
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </DialogFooter>
                </DialogContent>
            </FormSubmitter>
        </Dialog>
    );
}


// --- API impérative pour le composant parent ---
export type TableActionRef<TItem> = {
    create(): void;
    update(item: TItem): void;
    delete(item: TItem): void;
    close(): void
};

// --- Composant principal orchestrateur ---
interface TableActionManagerProps<TItem> {
    itemName: string;
    isLoading?: boolean; // Pour l'état global de chargement
    onConfirmDelete: (item: TItem) => void;
    onFormSubmit: (params: { data: any, type: MUTATION_ACTION, initialData?: TItem }) => void;
    renderForm: (value: { onSubmit?(value: any): void, initialData?: TItem }) => React.ReactNode; // Pour rendre le formulaire spécifique
}

export const TableActionManager = forwardRef(function TableActionManager<TItem = any>(
    { itemName, isLoading, onConfirmDelete, onFormSubmit, renderForm }: TableActionManagerProps<TItem>,
    ref: React.Ref<TableActionRef<TItem>>
) {
    const { dialogState, openCreate, openUpdate, openDelete, closeDialog } = useActionDialog<TItem>();

    // Exposer l'API impérative aux parents
    useImperativeHandle(ref, () => ({
        create: openCreate,
        update: openUpdate,
        delete: openDelete,
        close: closeDialog,
    }), [openCreate, openUpdate, openDelete, closeDialog]);

    useEffect(() => {
        if (!dialogState.isOpen) {
            document.body.style.pointerEvents = "auto";
        }
        return () => {
            document.body.style.pointerEvents = "auto";
        };
    }, [dialogState.isOpen]);


    const handleSubmit = useCallback((formData: any) => {
        console.log(formData)
        onFormSubmit({ data: formData, type: dialogState.type, initialData: dialogState.initialData });
    }, [onFormSubmit, dialogState.type]);


    // Rendu conditionnel des dialogues
    if (dialogState.type === MUTATION_ACTION.DELETE) {
        return (
            <DeleteConfirmationDialog
                itemName={itemName}
                isLoading={isLoading}
                onConfirmDelete={onConfirmDelete}
                itemToDelete={dialogState.initialData}
                isOpen={dialogState.isOpen}
                onOpenChange={closeDialog}
            />
        );
    }

    // Pour CREATE et EDIT
    if (dialogState.type === MUTATION_ACTION.CREATE || dialogState.type === MUTATION_ACTION.EDIT) {
        return (
            <FormActionDialog
                itemName={itemName}
                isLoading={isLoading}
                type={dialogState.type}
                isOpen={dialogState.isOpen}
                onOpenChange={closeDialog}
            >
                {renderForm({ initialData: dialogState.initialData, onSubmit: handleSubmit })}
            </FormActionDialog>
        );
    }

    return null; // Rien à rendre si le dialogue n'est pas ouvert ou le type n'est pas géré
});

// --- Hook pour l'intégration facile dans les composants parents ---
export function useTableAction<TItem = unknown>() {
    const tableActionRef = useRef<TableActionRef<TItem>>(null);

    const onCreate = useCallback(() => {
        tableActionRef.current?.create();
    }, []);

    const onUpdate = useCallback((item: TItem) => {
        tableActionRef.current?.update(item);
    }, []);

    const onDelete = useCallback((item: TItem) => {
        tableActionRef.current?.delete(item);
    }, []);

    const onClose = useCallback(() => {
        tableActionRef.current?.close();
    }, []);

    return {
        tableActionRef,
        onCreate,
        onUpdate,
        onDelete,
        onClose
    };
}

// --- EXEMPLE D'UTILISATION (non inclus dans le code final du composant) ---
/*
// Dans un composant parent:
import { TableActionManager, useTableAction, MUTATION_ACTION } from './TableActionManager'; // Ajustez le chemin

type MyData = {
    id: string;
    name: string;
    description: string;
};

function MyParentComponent() {
    const { tableActionRef, onCreate, onUpdate, onDelete } = useTableAction<MyData>();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmDelete = async (itemToDelete: MyData) => {
        setIsLoading(true);
        console.log("Confirmer la suppression de:", itemToDelete);
        // Simuler une API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        // Logique de suppression ici
        tableActionRef.current?.create(); // Pour fermer et réinitialiser après suppression (peut être fait dans le hook)
    };

    const handleFormSubmit = async (formData: any, type: MUTATION_ACTION, initialData?: MyData) => {
        setIsLoading(true);
        console.log(`Soumission du formulaire (${type}) avec les données:`, formData);
        if (type === MUTATION_ACTION.EDIT && initialData) {
            console.log("Données initiales pour l'édition:", initialData);
        }
        // Simuler une API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        // Logique de création/édition ici
        tableActionRef.current?.create(); // Pour fermer et réinitialiser après soumission
    };

    // Le formulaire réel sera rendu ici
    const renderMyForm = useCallback((type: MUTATION_ACTION, initialData?: MyData) => {
        // Ici, vous auriez un composant de formulaire dédié (ex: <MyItemForm />)
        // Vous pouvez utiliser 'initialData' pour pré-remplir le formulaire en mode édition
        return (
            <div className="space-y-4 py-4">
                <input
                    type="text"
                    placeholder="Nom"
                    defaultValue={initialData?.name || ''}
                    name="name" // Important pour FormSubmitter
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <textarea
                    placeholder="Description"
                    defaultValue={initialData?.description || ''}
                    name="description" // Important pour FormSubmitter
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
        );
    }, []);


    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Gestion des Items</h1>
            <Button onClick={onCreate} className="mr-2">Créer un Item</Button>
            <Button onClick={() => onUpdate({ id: "item-1", name: "Ancien Nom", description: "Ancienne Description" })} className="mr-2">Modifier Item 1</Button>
            <Button onClick={() => onDelete({ id: "item-2", name: "Item à Supprimer", description: "Ceci sera supprimé" })} variant="destructive">Supprimer Item 2</Button>

            <TableActionManager<MyData>
                ref={tableActionRef}
                itemName="Item"
                isLoading={isLoading}
                onConfirmDelete={handleConfirmDelete}
                onFormSubmit={handleFormSubmit}
                renderForm={renderMyForm}
            />
        </div>
    );
}

export default MyParentComponent;
*/