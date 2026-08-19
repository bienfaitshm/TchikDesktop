import React from "react";
import { useIdle } from "@/renderer/hooks/useIdle";
import { Screensaver } from "@/components/screen-save";

export type ScreenSaveProviderProps = {};

export const ScreenSaveProvider: React.FC<
  React.PropsWithChildren<ScreenSaveProviderProps>
> = ({ children }) => {
  // Déclenchement après 20 secondes
  const { isIdle, resetIdle } = useIdle(20 * 1000);

  return (
    <>
      {children}

      {isIdle && <Screensaver onDismiss={resetIdle} requiredPin="1234" />}
    </>
  );
};
