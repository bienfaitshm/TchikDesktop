import { useCallback, useState } from "react";

export function useConfirm<T = unknown>() {
  const [state, setState] = useState<{
    isOpen: boolean;
    data: T | null;
  }>({
    isOpen: false,
    data: null,
  });

  const onOpen = useCallback((data: T) => {
    setState({ isOpen: true, data });
  }, []);

  const onClose = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    onOpen,
    onClose,
  };
}
