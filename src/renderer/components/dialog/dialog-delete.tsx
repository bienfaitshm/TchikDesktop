"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { cn } from "@/renderer/utils"

/**
 * Hook générique pour piloter n'importe quel dialogue de confirmation
 */
export function useConfirm<T = unknown>() {
    const [state, setState] = React.useState<{
        isOpen: boolean
        data: T | null
    }>({
        isOpen: false,
        data: null,
    })

    const onOpen = React.useCallback((data: T) => {
        setState({ isOpen: true, data })
    }, [])

    const onClose = React.useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }))
    }, [])

    return {
        ...state,
        onOpen,
        onClose,
    }
}


interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    isLoading?: boolean
    title?: React.ReactNode
    description?: React.ReactNode
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "default" | "warning"
}

export const ConfirmDialog = React.forwardRef<HTMLDivElement, ConfirmDialogProps>(
    (
        {
            isOpen,
            onClose,
            onConfirm,
            isLoading = false,
            title = "Êtes-vous sûr ?",
            description = "Cette action est irréversible et supprimera définitivement les données.",
            confirmText = "Supprimer",
            cancelText = "Annuler",
            variant = "destructive",
        },
        ref
    ) => {
        const handleConfirm = async (e: React.MouseEvent) => {
            e.preventDefault()
            await onConfirm()
        }

        return (
            <Dialog modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    ref={ref}
                    className="sm:max-w-[425px] overflow-hidden gap-0 p-0"
                >
                    <div className="p-6">
                        <DialogHeader className="flex flex-col items-center gap-4 text-center sm:text-center">
                            {/* Icon Container */}
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full ring-8",
                                variant === "destructive" ? "bg-destructive/10 ring-destructive/5" : "bg-primary/10 ring-primary/5"
                            )}>
                                <AlertTriangle
                                    className={cn("h-6 w-6", variant === "destructive" ? "text-destructive" : "text-primary")}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="space-y-2">
                                <DialogTitle className="text-xl font-semibold tracking-tight">
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                    </div>

                    <DialogFooter className="bg-muted/50 p-4 gap-2 sm:gap-0 sm:justify-center border-t">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none min-w-[100px]"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            variant={variant}
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none min-w-[100px]"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Traitement..." : confirmText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }
)

ConfirmDialog.displayName = "ConfirmDialog"


interface DeleteConfirmProps<T> extends Omit<ConfirmDialogProps, "onConfirm" | "onClose" | "isOpen"> {
    item: T | null
    isOpen: boolean
    onClose: () => void
    onConfirm: (item: T) => void | Promise<void>
    itemName?: string
}

export const ConfirmDeleteDialog = <T,>({
    item,
    onConfirm,
    itemName,
    ...props
}: DeleteConfirmProps<T>) => {
    return (
        <ConfirmDialog
            {...props}
            variant="destructive"
            title="Confirmation de suppression"
            description={
                itemName ? (
                    <span>
                        Voulez-vous vraiment supprimer <strong>{itemName}</strong> ? <br />
                        Cette action est irréversible.
                    </span>
                ) : undefined
            }
            onConfirm={() => item && onConfirm(item)}
        />
    )
}