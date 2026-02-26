import { useCallback, useEffect, useState } from "react";
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

// --- Custom Hook to Manage the Dialog State ---
// This hook encapsulates all the logic for opening, closing, and confirming the dialog.
// It's the "brain" of the component, allowing the parent component to control it declaratively.
export const useConfirmDeleteDialog = <T extends object>() => {
    const [item, setItem] = useState<T | undefined>(undefined);
    const [open, setOpen] = useState(false);

    const onOpen = useCallback((data: T) => {
        setItem(data);
        setOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setOpen(false);
        setItem(undefined); // Clear item on close for safety
    }, []);

    return { item, open, onOpen, onClose };
};


export const DialogConfirmDelete = <T extends object>({
    item,
    open,
    onClose,
    onConfirm,
    isLoading = false,
}: {
    item: T | undefined;
    open: boolean;
    onClose: () => void;
    onConfirm: (item: T) => void;
    isLoading?: boolean;
}) => {
    useEffect(() => {
        if (!open) {
            document.body.style.pointerEvents = "auto";
        }
        return () => {
            document.body.style.pointerEvents = "auto";
        };
    }, [open]);

    const handleConfirm = useCallback(() => {
        if (item) {
            onConfirm(item);
        }
    }, [item, onConfirm]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Voulez-vous vraiment supprimer ?
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-4">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isLoading}>
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleConfirm}
                        variant="destructive"
                        disabled={isLoading}
                    >
                        {isLoading ? "Suppression..." : "Confirmer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
