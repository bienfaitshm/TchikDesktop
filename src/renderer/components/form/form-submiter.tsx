import React, { createContext, useContext, useRef, cloneElement, type ReactNode, isValidElement } from "react";

type TFormSubmitterContext = {
    submit: () => void;
    submitButtonRef: React.RefObject<HTMLButtonElement>
};

const FormSubmitterContext = createContext<TFormSubmitterContext | null>(null);

// Custom hook to provide a more convenient and safe way to access the context
const useFormSubmitterContext = () => {
    const context = useContext(FormSubmitterContext);
    if (!context) {
        throw new Error("FormSubmitter components must be used within a FormSubmitter.Root");
    }
    return context;
};


const FormSubmitterProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const submit = () => submitButtonRef.current?.click();

    return (
        <FormSubmitterContext.Provider value={{ submit, submitButtonRef }}>
            {children}
        </FormSubmitterContext.Provider>
    );
};

type FormSubmitterWrapperProps = {
    children: ReactNode;
}
const FormSubmitterWrapper: React.FC<FormSubmitterWrapperProps> = ({ children }) => {
    const { submitButtonRef } = useFormSubmitterContext();
    const formElement = isValidElement(children) ?
        cloneElement(children as React.ReactElement, {
            children: (
                <>
                    <button className="hidden" type="submit" ref={submitButtonRef} />
                </>
            ),
        })
        : children;
    return (
        <>{formElement}</>
    )
}

type FormSubmitterTriggerProps = {
    children: ReactNode;
    asChild?: boolean;
};

const FormSubmitterTrigger = ({ children, asChild }: FormSubmitterTriggerProps) => {
    const { submit } = useFormSubmitterContext();

    if (!isValidElement(children)) {
        console.warn("FormSubmitter.Trigger expects a valid React element as its child.");
        return null;
    }

    const clonedChild = cloneElement(children, asChild ? {
        onClick: submit,
    } : {});

    return <>{clonedChild}</>;
};


// Combining all parts into a single, well-structured component.
export const FormSubmitter = Object.assign(FormSubmitterProvider, {
    Trigger: FormSubmitterTrigger,
    Wrapper: FormSubmitterWrapper,
});

