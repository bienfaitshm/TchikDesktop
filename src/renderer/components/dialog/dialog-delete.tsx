import { useCallback, useImperativeHandle, useRef, useState, forwardRef } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Button } from "../ui/button";

export type DialogConfirmDeleteState = {
    item?: unknown;
    open: boolean;
};

export type DialogConfirmDeleteProps = {
    onConfirmDelete: (item: unknown) => void;
};

export type DialogConfirmDeleteRef = {
    openDialog: (item?: unknown) => void;
};

export const DialogConfirmDelete = forwardRef<DialogConfirmDeleteRef, DialogConfirmDeleteProps>(
    ({ onConfirmDelete }, ref) => {
        const [state, setState] = useState<DialogConfirmDeleteState>({ open: false, item: undefined });

        const handleOpenChange = useCallback((open: boolean) => {
            setState(prev => ({ ...prev, open, item: open ? prev.item : undefined }));
        }, []);

        const handleConfirmDelete = useCallback(() => {
            onConfirmDelete(state.item);
            setState(prev => ({ ...prev, open: false, item: undefined }));
        }, [onConfirmDelete, state.item]);

        useImperativeHandle(ref, () => ({
            openDialog: (item?: unknown) => setState({ open: true, item }),
        }), []);

        return (
            <Dialog open={state.open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            Voulez-vous vraiment supprimer&nbsp;?
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-4">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Annuler
                            </Button>
                        </DialogClose>
                        <Button onClick={handleConfirmDelete} variant="destructive">
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
);

DialogConfirmDelete.displayName = "DialogConfirmDelete";

export const useDialogConfirmDelete = () => useRef<DialogConfirmDeleteRef>(null);
