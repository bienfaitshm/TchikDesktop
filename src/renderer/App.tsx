import { ThemeProvider } from "@/renderer/providers/theme";
import { TooltipProvider } from "@/renderer/components/ui/tooltip";
import Router from "@/renderer/screens/router";
import QueryProvider from "@/renderer/libs/queries/providers";
import { Toaster } from "@/renderer/components/ui/sonner";
import { SuspenseErrorBoundary } from "@/renderer/libs/queries/suspense";
import ErrorPage from "@/renderer/screens/error";
import type { JSX } from "react";

function App(): JSX.Element {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider>
          <SuspenseErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <ErrorPage error={error as Error} onRetry={resetErrorBoundary} />
            )}
          >
            <Router />
            <Toaster position="top-center" />
          </SuspenseErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
