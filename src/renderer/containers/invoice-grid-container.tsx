import React from "react";
import { cn } from "@/renderer/utils";

/**
 * Props interface for invoice layout container components.
 * Extends standard HTML div element attributes for maximum flexibility.
 */
export type InvoiceGridContainerProps = React.ComponentProps<"div">;

/**
 * Root grid container component establishing the responsive layout for invoice forms.
 *
 * @param props - Standard HTML div props including className and children.
 * @returns Styled outer grid wrapper element.
 */
export const InvoiceGridContainer = ({
  className,
  children,
  ...props
}: InvoiceGridContainerProps): React.JSX.Element => (
  <div
    className={cn(
      "grid grid-cols-1 lg:grid-cols-12 gap-x-24 items-start",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * Form section container occupying 8 grid columns on large screens.
 *
 * @param props - Standard HTML div props including className and children.
 * @returns Styled form layout section element.
 */
export const InvoiceGridFormContainer = ({
  className,
  children,
  ...props
}: InvoiceGridContainerProps): React.JSX.Element => (
  <div
    className={cn("lg:col-span-8 flex flex-col gap-6", className)}
    {...props}
  >
    {children}
  </div>
);

/**
 * Live preview section container occupying 4 grid columns on large screens.
 *
 * @param props - Standard HTML div props including className and children.
 * @returns Styled preview layout section element.
 */
export const InvoiceGridPreviewContainer = ({
  className,
  children,
  ...props
}: InvoiceGridContainerProps): React.JSX.Element => (
  <div className={cn("lg:col-span-4", className)} {...props}>
    {children}
  </div>
);
