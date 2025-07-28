import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "../form/button-loader"

export interface FormDialogProps {
    header?: React.ReactNode,
    isPeding?: boolean,
    children: React.ReactElement<any>,
    buttonTrigger: React.ReactNode
}

export const FormDialogHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <DialogHeader>{children}</DialogHeader>
}

export const FormDialog: React.FC<React.PropsWithChildren<FormDialogProps>> = ({ header, isPeding, children, buttonTrigger }) => {
    const btnRef = React.useRef<HTMLButtonElement>(null)
    if (!React.isValidElement(children)) {
        console.warn("Le componsant passer n'est pas valide")
        return null
    }
    const formComponent = React.cloneElement(children, { children: <button type="submit" ref={btnRef} /> })
    return (
        <Dialog>
            <DialogTrigger asChild>{buttonTrigger}</DialogTrigger>
            <DialogContent>
                {header}
                {formComponent}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Fermer</Button>
                    </DialogClose>
                    <ButtonLoader
                        disabled={isPeding}
                        isLoading={isPeding}
                        isLoadingText="Enregistrement..."
                    >
                        Enregistrer
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}