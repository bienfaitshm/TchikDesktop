import * as React from "react";

type TriggerProps<T extends Record<string, unknown>> = T & {
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
};

/**
 * Injecte en toute sécurité des props dans un élément React enfant (Trigger)
 */
export function cloneElementWithProps<T extends Record<string, unknown>>(
  children: React.ReactNode,
  props: TriggerProps<T>,
): React.ReactNode {
  if (!React.isValidElement(children)) {
    return children;
  }

  return React.cloneElement(children as React.ReactElement<TriggerProps<T>>, {
    ...props,
    onClick: (e: React.MouseEvent) => {
      //   children?.props?.onClick?.(e)
      props.onClick?.(e);
    },
  });
}
