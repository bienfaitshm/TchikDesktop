import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTrigger, DialogTitle, DialogDescription } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "../form/button-loader"
import type { DialogTitleProps, DialogDescriptionProps } from "@radix-ui/react-dialog"

export interface FormDialogProps {
    header?: React.ReactNode,
    isPeding?: boolean,
    children: React.ReactElement<any>,
    buttonTrigger: React.ReactNode
}

export const FormDialogTitle: React.FC<DialogTitleProps> = (props) => <DialogTitle {...props} />
export const FormDialogDescription: React.FC<DialogDescriptionProps> = (props) => <DialogDescription {...props} />
export const FormDialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => <DialogHeader {...props} />


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
                        <Button variant="outline">Fermer</Button>
                    </DialogClose>
                    <ButtonLoader
                        onClick={() => btnRef.current?.click()}
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