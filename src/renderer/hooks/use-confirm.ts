import { useCallback, useState } from "react";

type UseConfirmParams<T = unknown> = {
  open?: boolean;
  onOpenChange?(open: boolean): void;
  defaultOpen?: boolean;
  defaultData?: T | null;
};

export function useConfirm<T = unknown>(params: UseConfirmParams<T> = {}) {
  const {
    open,
    onOpenChange,
    defaultOpen = false,
    defaultData = null,
  } = params;

  const isControlled = open !== undefined;

  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(defaultOpen);
  const [data, setData] = useState<T | null>(defaultData);

  const isOpen = isControlled ? open : internalIsOpen;

  const setIsOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalIsOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const onOpen = useCallback(
    (customData?: T) => {
      if (customData !== undefined) {
        setData(customData);
      }
      setIsOpen(true);
    },
    [setIsOpen],
  );

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return {
    isOpen,
    data,
    onOpen,
    onClose,
    setData,
  };
}
