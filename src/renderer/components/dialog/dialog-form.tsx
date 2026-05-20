import React, {
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    forwardRef,
    createContext
} from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/renderer/components/ui/dialog";
import { Slot } from "@radix-ui/react-slot";

export interface ImperativeFormDialogHandle<T = any> {
    open: (data?: T) => void;
    close: () => void;
    submit: () => void;
}

interface FormDialogContextType<T = any> {
    isOpen: boolean;
    data: T | null;
    submitButtonRef: React.RefObject<HTMLButtonElement | null>;
    open: (data?: T) => void;
    close: () => void;
    submit: () => void;
}

const FormDialogContext = createContext<FormDialogContextType | null>(null);

export function useFormDialog<T = any>() {
    const ctx = useContext(FormDialogContext);
    if (!ctx) throw new Error("useFormDialog must be used within FormDialog.Root");
    return ctx as FormDialogContextType<T>;
};


export function useFormDialogRef<T = any>() {
    return React.createRef<ImperativeFormDialogHandle<T>>();
}

/**
 * Root Component
 */
const FormDialogRoot = forwardRef<ImperativeFormDialogHandle, React.PropsWithChildren<{ onOpenChange?: (open: boolean) => void }>>(
    ({ children, onOpenChange }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [data, setData] = useState<any>(null);
        const submitButtonRef = useRef<HTMLButtonElement>(null);

        const open = useCallback((initialData?: any) => {
            setData(initialData ?? null);
            setIsOpen(true);
            onOpenChange?.(true);
        }, [onOpenChange]);

        const close = useCallback(() => {
            setIsOpen(false);
            onOpenChange?.(false);
        }, [onOpenChange]);

        const submit = useCallback(() => submitButtonRef.current?.click(), []);

        useImperativeHandle(ref, () => ({ open, close, submit }), [open, close, submit]);

        const contextValue = useMemo(() => ({
            isOpen, data, open, close, submit, submitButtonRef
        }), [isOpen, data, open, close, submit]);

        return (
            <FormDialogContext.Provider value={contextValue}>
                <Dialog open={isOpen} onOpenChange={(val) => {
                    if (!val) close();
                    else open();
                }}>
                    {children}
                </Dialog>
            </FormDialogContext.Provider>
        );
    }
);

/**
 * FormWrapper : Reçoit les données du contexte et les passe au formulaire enfant
 */
function FormWrapper<T = any,>({ children }: { children: (data: T | null) => React.ReactNode }) {
    const { submitButtonRef, data } = useFormDialog<T>();
    return (
        <div className="contents">
            {children(data)}
            <button ref={submitButtonRef} type="submit" className="hidden" aria-hidden="true" />
        </div>
    );
};

/**
 * ActionButton : Supporte l'ouverture avec data
 */
interface ActionButtonProps<T = any> {
    asChild?: boolean;
    children: React.ReactNode;
    initialValues?: T;
    onClickAction?: (ctx: FormDialogContextType<T>) => void;
}

const ActionButton = <T,>({ asChild, children, onClickAction, initialValues }: ActionButtonProps<T>) => {
    const ctx = useFormDialog<T>();
    const Component = asChild ? Slot : "button";

    return (
        <Component onClick={() => onClickAction ? onClickAction(ctx) : ctx.open(initialValues)}>
            {children}
        </Component>
    );
};

export const FormDialog = {
    Root: FormDialogRoot,
    Header: DialogHeader,
    Footer: DialogFooter,
    Title: DialogTitle,
    Description: DialogDescription,
    Content: DialogContent,
    Form: FormWrapper,
    Trigger: <T,>(props: ActionButtonProps<T>) => <ActionButton {...props} onClickAction={(c) => c.open(props.initialValues)} />,
    Close: <T,>(props: ActionButtonProps<T>) => <ActionButton {...props} onClickAction={(c) => c.close()} />,
    Submit: <T,>(props: ActionButtonProps<T>) => <ActionButton {...props} onClickAction={(c) => c.submit()} />,
};