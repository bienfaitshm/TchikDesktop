import * as React from "react";

/**
 * @interface UpdateDialogHandle
 * @template TInitialValue The type of the initial value passed to the update dialog.
 * @property {function(TInitialValue): void} openDialog - Function to open the update dialog with a specific initial value.
 */
interface UpdateDialogHandle<TInitialValue = unknown> {
    openDialog(initialValue: TInitialValue): void;
}

/**
 * @function useUpdateDialogRef
 * @description Creates and returns a ref for controlling an update dialog imperatively.
 * This ref can be attached to a component wrapped with `withUpdateDialog` to
 * programmatically open the dialog and pass initial data.
 * @template TInitialValue The type of the initial value the dialog expects.
 * @returns {React.RefObject<UpdateDialogHandle<TInitialValue>>} A ref object.
 *
 * @example
 * ```typescript
 * const myDialogRef = useUpdateDialogRef<MyDataType>();
 * // ... later in a button click handler
 * myDialogRef.current?.openDialog({ id: 1, name: "Example" });
 * ```
 */
export function useUpdateDialogRef<TInitialValue = unknown>() {
    return React.useRef<UpdateDialogHandle<TInitialValue>>(null);
}

/**
 * @function useImperativeUpdateDialog
 * @description Provides an imperative handle for an update dialog and manages its initial state.
 * This hook is intended to be used within a component that is exposed via `React.forwardRef`
 * and wrapped with `withUpdateDialog`. It links the `openDialog` method of the ref to
 * setting the internal state for the dialog's initial value.
 * @template TInitialValue The type of the initial value for the dialog.
 * @param {React.Ref<UpdateDialogHandle<TInitialValue>>} ref The ref object passed from the parent component.
 * @param {function(): void} [onOpenCallback] An optional callback function that is invoked when the dialog is opened.
 * @returns {[TInitialValue | null, React.Dispatch<React.SetStateAction<TInitialValue | null>>]}
 * A tuple containing the initial value state and its setter.
 *
 * @example
 * ```typescript
 * const MyUpdateDialog = withUpdateDialog((props, ref) => {
 * const [initialData, setInitialData] = useImperativeUpdateDialog(ref, () => console.log("Dialog opened!"));
 *
 * React.useEffect(() => {
 * if (initialData) {
 * // Logic to populate form fields with initialData
 * }
 * }, [initialData]);
 *
 * return (
 * // Your dialog JSX, conditionally rendered based on initialData or an internal `isOpen` state
 * <div>{initialData ? `Editing: ${initialData.name}` : "Dialog closed"}</div>
 * );
 * });
 * ```
 */
export function useImperativeUpdateDialog<TInitialValue = unknown>(
    ref: React.Ref<UpdateDialogHandle<TInitialValue>>,
    onOpenCallback?: () => void
) {
    const [initialValue, setInitialValue] = React.useState<TInitialValue | undefined>(
        undefined
    );

    React.useImperativeHandle(
        ref,
        () => ({
            openDialog(initialValue) {
                onOpenCallback?.();
                setInitialValue(initialValue);
            },
        }),
        []
    );

    return [initialValue, setInitialValue] as const;
}

/**
 * @function withUpdateDialog
 * @description A higher-order component (HOC) that wraps a functional component with `React.forwardRef`.
 * This allows the wrapped component to receive a ref and expose an `UpdateDialogHandle` interface,
 * enabling imperative control (like opening a dialog) from a parent component.
 * @template TProps The props type of the wrapped component.
 * @template TInitialValue The type of the initial value the dialog expects.
 * @param {React.ForwardRefRenderFunction<UpdateDialogHandle<TInitialValue>, React.PropsWithoutRef<TProps>>} component
 * The functional component to be wrapped, which should accept props and a ref.
 * @returns {React.ForwardRefExoticComponent<React.PropsWithoutRef<TProps> & React.RefAttributes<UpdateDialogHandle<TInitialValue>>>}
 * The wrapped component with forwardRef capabilities.
 *
 * @example
 * ```typescript
 * interface MyDialogProps {
 * title: string;
 * }
 *
 * interface MyDialogInitialValue {
 * id: number;
 * name: string;
 * }
 *
 * const MyDialogComponent = ({ title }: MyDialogProps, ref: React.Ref<UpdateDialogHandle<MyDialogInitialValue>>) => {
 * const [dataToEdit, setDataToEdit] = useImperativeUpdateDialog(ref);
 *
 * return (
 * <div>
 * <h2>{title}</h2>
 * {dataToEdit && <p>Currently editing item with ID: {dataToEdit.id}</p>}
 * // ... dialog content
 * </div>
 * );
 * };
 *
 * const WrappedMyDialog = withUpdateDialog(MyDialogComponent);
 *
 * // In a parent component:
 * // const dialogRef = useUpdateDialogRef<MyDialogInitialValue>();
 * // <WrappedMyDialog ref={dialogRef} title="Edit Item" />
 * // <button onClick={() => dialogRef.current?.openDialog({ id: 123, name: "Test Item" })}>Open Edit Dialog</button>
 * ```
 */
export function withUpdateDialog<TProps, TInitialValue = unknown>(
    component: React.ForwardRefRenderFunction<
        UpdateDialogHandle<TInitialValue>,
        React.PropsWithoutRef<TProps>
    >
) {
    return React.forwardRef<UpdateDialogHandle<TInitialValue>, TProps>(
        component
    );
}