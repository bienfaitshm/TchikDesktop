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

import { AlertTriangle } from "lucide-react"
import { Button } from "@/renderer/components/ui/button";
import { TypographyP, TypographySmall } from "../ui/typography";


export const useConfirmDeleteDialog = <T extends object>() => {
    const [item, setItem] = useState<T | undefined>(undefined);
    const [open, setOpen] = useState(false);

    const onOpen = useCallback((data?: T) => {
        setItem(data);
        setOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setOpen(false);
        setItem(undefined);
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


interface ConfirmDeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
    title?: string
    description?: string
    itemName?: string
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title = "Confirmation de suppression",
    description = "Cette action est irréversible et supprimera définitivement les données.",
    itemName,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
                    </div>

                    <DialogTitle className="text-center text-xl">
                        {title}
                    </DialogTitle>

                    <DialogDescription className="text-center">
                        {itemName ? (
                            <>
                                <TypographyP>
                                    Voulez-vous vraiment supprimer <strong>{itemName}</strong> ?
                                </TypographyP>
                                <TypographySmall>
                                    {description}
                                </TypographySmall>
                            </>
                        ) : (
                            description
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto min-w-[100px]"
                    >
                        {isLoading ? "Suppression..." : "Supprimer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}