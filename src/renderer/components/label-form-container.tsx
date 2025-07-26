/**
 * container component with label
 * @param label string
 * @param children ReactNode
 * @returns ReactNode
 */
export const LabelFormContainer: React.FC<React.PropsWithChildren<{
  label: string;
}>> = ({ label, children }) => (
  <div className="grid grid-cols-4 gap-4">
    <h4 className="scroll-m-20 mt-1 text-foreground text-xs font-semibold tracking-tight uppercase col-span-1">
      {label}
    </h4>
    <div className="col-span-3">{children}</div>
  </div>
);
