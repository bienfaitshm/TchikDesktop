import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/renderer/components/ui/dialog";
import type {
    DialogTitleProps,
    DialogDescriptionProps,
} from "@radix-ui/react-dialog";

/**
 * @interface ImperativeFormDialogHandle
 * @description Defines the imperative methods available on a form dialog component.
 * These methods allow a parent component to control the dialog's visibility and trigger form submission.
 * @property {function(): void} openDialog - Opens the form dialog.
 * @property {function(): void} closeDialog - Closes the form dialog.
 * @property {function(): void} triggerSubmit - Programmatically triggers the form's submit action within the dialog.
 */
export interface ImperativeFormDialogHandle {
    openDialog(): void;
    closeDialog(): void;
    triggerSubmit(): void;
}

/**
 * @typedef {Object} FormDialogContextType
 * @description The shape of the context provided to children of `FormDialog`.
 * This context allows child components to interact with the dialog's state and actions.
 * @property {boolean} isOpen - Indicates whether the dialog is currently open.
 * @property {React.RefObject<HTMLButtonElement>} submitButtonRef - A ref to the hidden submit button within the dialog's form.
 * @property {function(): void} closeDialog - Function to close the dialog.
 * @property {function(): void} openDialog - Function to open the dialog.
 * @property {function(): void} triggerSubmit - Function to trigger the form's submission.
 */
export type FormDialogContextType = {
    isOpen: boolean;
    submitButtonRef: React.RefObject<HTMLButtonElement>;
} & Pick<
    ImperativeFormDialogHandle,
    "closeDialog" | "openDialog" | "triggerSubmit"
>;

/**
 * @interface FormDialogRootProps
 * @description Props for the `FormDialogRoot` component.
 */
export interface FormDialogRootProps {
    /**
     * Optional callback function that fires when the dialog's open state changes.
     * @param {boolean} open - The new open state of the dialog.
     */
    onOpenChange?: (open: boolean) => void;
}

/**
 * @constant FormDialogContext
 * @description React Context for sharing form dialog state and imperative functions with nested components.
 */
export const FormDialogContext =
    React.createContext<FormDialogContextType | null>(null);

/**
 * @function useFormDialogContext
 * @description A hook to access the `FormDialogContext`.
 * This hook should be used by components nested within `FormDialogRoot` to interact with the dialog.
 * @returns {FormDialogContextType | null} The context value, or `null` if used outside of a `FormDialogRoot`.
 */
export const useFormDialogContext = () =>
    React.useContext<FormDialogContextType | null>(FormDialogContext);

/**
 * @function useFormDialogRef
 * @description Creates and returns a ref object for controlling a `FormDialogRoot` component imperatively.
 * Attach this ref to `FormDialogRoot` to programmatically open, close, or submit the dialog.
 * @returns {React.RefObject<ImperativeFormDialogHandle>} A ref object.
 *
 * @example
 * ```typescript
 * const dialogRef = useFormDialogRef();
 * // ... later in a button click handler
 * dialogRef.current?.openDialog();
 * ```
 */
export const useFormDialogRef = () =>
    React.useRef<ImperativeFormDialogHandle>(null);

/**
 * @component FormDialogRoot
 * @description The main component for a form dialog, providing context and imperative control.
 * It renders a Radix UI `Dialog` and manages its open/close state. It also exposes
 * methods for controlling the dialog (open, close, submit) via a ref.
 * @param {React.PropsWithChildren<FormDialogRootProps>} { children, ref } - React props, including children and a ref.
 * @param {React.Ref<ImperativeFormDialogHandle>} ref - A ref object to imperatively control the dialog.
 * @returns {JSX.Element} The rendered dialog component.
 *
 * @example
 * ```typescript
 * const MyFormDialog = () => {
 * const dialogRef = useFormDialogRef();
 *
 * return (
 * <>
 * <button onClick={() => dialogRef.current?.openDialog()}>Open Form Dialog</button>
 * <FormDialog.Root ref={dialogRef}>
 * <FormDialog.Header>
 * <FormDialog.Title>New Item</FormDialog.Title>
 * <FormDialog.Description>Fill in the details for the new item.</FormDialog.Description>
 * </FormDialog.Header>
 * <FormDialog.Content>
 * <FormDialog.FormWrapper>
 * <form onSubmit={(e) => { e.preventDefault(); console.log('Form submitted!'); dialogRef.current?.closeDialog(); }}>
 * <input type="text" placeholder="Item Name" />
 * </form>
 * </FormDialog.FormWrapper>
 * </FormDialog.Content>
 * <FormDialog.Footer>
 * <FormDialog.Close asChild>
 * <button>Cancel</button>
 * </FormDialog.Close>
 * <FormDialog.Submit asChild>
 * <button type="button">Save</button> // Type button to prevent native form submission
 * </FormDialog.Submit>
 * </FormDialog.Footer>
 * </FormDialog.Root>
 * </>
 * );
 * };
 * ```
 */
export const FormDialogRoot = React.forwardRef<
    ImperativeFormDialogHandle,
    React.PropsWithChildren<FormDialogRootProps>
>(({ children, onOpenChange }, ref) => {
    const submitButtonRef = React.useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    // Memoized callback to trigger the hidden submit button click
    const triggerSubmit = React.useCallback(() => {
        submitButtonRef.current?.click();
    }, []);

    // Memoized callback to close the dialog
    const closeDialog = React.useCallback(() => {
        setIsOpen(false);
        onOpenChange?.(false); // Notify parent of open state change
    }, [onOpenChange]);

    // Memoized callback to open the dialog
    const openDialog = React.useCallback(() => {
        setIsOpen(true);
        onOpenChange?.(true); // Notify parent of open state change
    }, [onOpenChange]);

    // Expose imperative methods via the ref
    React.useImperativeHandle(
        ref,
        () => ({
            triggerSubmit,
            closeDialog,
            openDialog,
        }),
        [triggerSubmit, closeDialog, openDialog]
    );

    return (
        <FormDialogContext.Provider
            value={{ isOpen, closeDialog, openDialog, submitButtonRef, triggerSubmit }}
        >
            <Dialog
                open={isOpen}
                onOpenChange={(newOpenState) => {
                    setIsOpen(newOpenState);
                    onOpenChange?.(newOpenState);
                }}
            >
                {children}
            </Dialog>
        </FormDialogContext.Provider>
    );
});

/**
 * @component FormDialogFormWrapper
 * @description A wrapper component intended to encapsulate a form within the `FormDialogRoot`.
 * It injects a hidden submit button into the form's children, which can then be
 * programmatically clicked via `triggerSubmit` from the dialog context.
 * @param {React.PropsWithChildren<{ children: React.ReactNode }>} { children } - React children, expected to be a `form` element.
 * @returns {JSX.Element | null} The cloned form component with a hidden submit button, or `null` if children is not a valid React element.
 *
 * @example
 * ```tsx
 * <FormDialog.Content>
 * <FormDialog.FormWrapper>
 * <form onSubmit={handleSubmit}>
 * <input type="text" name="name" />
 * <button type="submit" className="hidden-visually"></button>
 * </form>
 * </FormDialog.FormWrapper>
 * </FormDialog.Content>
 * ```
 */
export const FormDialogFormWrapper: React.FC<
    React.PropsWithChildren<{ children: React.ReactNode }>
> = ({ children }) => {
    const ctx = useFormDialogContext();
    if (!React.isValidElement(children)) {
        console.warn(
            "FormDialogFormWrapper expects a valid React element as its child (e.g., a <form> element)."
        );
        return null;
    }
    // Clone the form element and inject a hidden submit button
    const formComponent = React.cloneElement(children as React.ReactElement, {
        children: (
            <>
                {children.props.children} {/* Render existing children */}
                <button className="hidden" type="submit" ref={ctx?.submitButtonRef} />
            </>
        ),
    });
    return <>{formComponent}</>;
};

/**
 * @component FormDialogCloseButton
 * @description A component to create a button that closes the `FormDialogRoot`.
 * It leverages the `closeDialog` function from the `FormDialogContext`.
 * @param {React.PropsWithChildren<{ children: React.ReactNode, asChild?: boolean }>} { children, asChild } - React props.
 * `children` is the element to be rendered (e.g., a button). `asChild` determines if the onClick is passed to the child directly.
 * @returns {JSX.Element | null} The cloned child component with the click handler, or `null` if children is not a valid React element.
 *
 * @example
 * ```tsx
 * <FormDialog.CloseButton asChild>
 * <Button variant="outline">Cancel</Button>
 * </FormDialog.CloseButton>
 * // Or
 * <FormDialog.CloseButton>
 * <button>Close Dialog</button>
 * </FormDialog.CloseButton>
 * ```
 */
export const FormDialogCloseButton: React.FC<
    React.PropsWithChildren<{ children: React.ReactNode; asChild?: boolean }>
> = ({ children, asChild }) => {
    const ctx = useFormDialogContext();
    if (!React.isValidElement(children)) {
        console.warn(
            "FormDialogCloseButton expects a valid React element as its child."
        );
        return null;
    }
    const clonedChild = React.cloneElement(
        children as React.ReactElement,
        asChild ? { onClick: ctx?.closeDialog } : {}
    );
    return <>{clonedChild}</>;
};

/**
 * @component FormDialogTriggerButton
 * @description A component to create a button that opens the `FormDialogRoot`.
 * It uses the `openDialog` function from the `FormDialogContext`.
 * @param {React.PropsWithChildren<{ children: React.ReactNode, asChild?: boolean }>} { children, asChild } - React props.
 * `children` is the element to be rendered (e.g., a button). `asChild` determines if the onClick is passed to the child directly.
 * @returns {JSX.Element | null} The cloned child component with the click handler, or `null` if children is not a valid React element.
 *
 * @example
 * ```tsx
 * <FormDialog.TriggerButton asChild>
 * <Button>Open Form</Button>
 * </FormDialog.TriggerButton>
 * ```
 */
export const FormDialogTriggerButton: React.FC<
    React.PropsWithChildren<{ children: React.ReactNode; asChild?: boolean }>
> = ({ children, asChild }) => {
    const ctx = useFormDialogContext();
    if (!React.isValidElement(children)) {
        console.warn(
            "FormDialogTriggerButton expects a valid React element as its child."
        );
        return null;
    }
    const clonedChild = React.cloneElement(
        children as React.ReactElement,
        asChild ? { onClick: ctx?.openDialog } : {}
    );
    return <>{clonedChild}</>;
};

/**
 * @component FormDialogSubmitButton
 * @description A component to create a button that triggers the form submission within the `FormDialogRoot`.
 * It uses the `triggerSubmit` function from the `FormDialogContext`.
 * @param {React.PropsWithChildren<{ children: React.ReactNode, asChild?: boolean }>} { children, asChild } - React props.
 * `children` is the element to be rendered (e.g., a button). `asChild` determines if the onClick is passed to the child directly.
 * @returns {JSX.Element | null} The cloned child component with the click handler, or `null` if children is not a valid React element.
 *
 * @example
 * ```tsx
 * <FormDialog.SubmitButton asChild>
 * <Button type="button">Save Changes</Button>
 * </FormDialog.SubmitButton>
 * ```
 */
export const FormDialogSubmitButton: React.FC<
    React.PropsWithChildren<{ children: React.ReactNode; asChild?: boolean }>
> = ({ children, asChild }) => {
    const ctx = useFormDialogContext();
    if (!React.isValidElement(children)) {
        console.warn(
            "FormDialogSubmitButton expects a valid React element as its child."
        );
        return null;
    }
    const clonedChild = React.cloneElement(
        children as React.ReactElement,
        asChild ? { onClick: ctx?.triggerSubmit } : {}
    );
    return <>{clonedChild}</>;
};

/**
 * @namespace FormDialog
 * @description A collection of components to build a robust and controlled form dialog.
 * @property {React.ForwardRefExoticComponent<React.PropsWithChildren<FormDialogRootProps> & React.RefAttributes<ImperativeFormDialogHandle>>} Root - The main dialog component.
 * @property {React.FC<DialogTitleProps>} Title - Renders the dialog title (from Radix UI).
 * @property {React.FC<DialogDescriptionProps>} Description - Renders the dialog description (from Radix UI).
 * @property {React.FC<React.HTMLAttributes<HTMLDivElement>>} Header - Renders the dialog header (from Radix UI).
 * @property {React.FC<React.HTMLAttributes<HTMLDivElement>>} Content - Renders the dialog content (from Radix UI).
 * @property {React.FC<React.HTMLAttributes<HTMLDivElement>>} Footer - Renders the dialog footer (from Radix UI).
 * @property {React.FC<React.PropsWithChildren<{ children: React.ReactNode }>>} FormWrapper - Wraps the form inside the dialog.
 * @property {React.FC<React.PropsWithChildren<{ children: React.ReactNode, asChild?: boolean }>>} CloseButton - A button to close the dialog.
 * @property {React.FC<React.PropsWithChildren<{ children: React.ReactNode, asChild?: boolean }>>} TriggerButton - A button to open the dialog.
 * @property {React.FC<React.PropsWithChildren<{ children: React.ReactNode, asChild?: boolean }>>} SubmitButton - A button to trigger form submission.
 */
export const FormDialog = {
    Root: FormDialogRoot,
    Title: (props: DialogTitleProps) => <DialogTitle {...props} />,
    Description: (props: DialogDescriptionProps) => (
        <DialogDescription {...props} />
    ),
    Header: (props: React.HTMLAttributes<HTMLDivElement>) => (
        <DialogHeader {...props} />
    ),
    Content: (props: React.HTMLAttributes<HTMLDivElement>) => (
        <DialogContent {...props} />
    ),
    Footer: (props: React.HTMLAttributes<HTMLDivElement>) => (
        <DialogFooter {...props} />
    ),
    FormWrapper: FormDialogFormWrapper,
    CloseButton: FormDialogCloseButton,
    TriggerButton: FormDialogTriggerButton,
    SubmitButton: FormDialogSubmitButton,
};