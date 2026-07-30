import type { JSX } from "react";
import { ThemeProvider } from "@/renderer/providers/theme";
import { TooltipProvider } from "@/renderer/components/ui/tooltip";
import Router from "@/renderer/screens/router";
import QueryProvider from "@/renderer/libs/queries/providers";
import { Toaster } from "@/renderer/components/ui/sonner";
import { SuspenseErrorBoundary } from "@/renderer/libs/queries/suspense";
import ErrorPage from "@/renderer/screens/error";
import { apiClient } from "@/renderer/libs/apis";
import { getConfig } from "@/renderer/libs/stores/app-store";
import { StoreProvider } from "@/renderer/libs/stores/provider";

apiClient.interceptors.request.use(async (payload) => {
  const { schoolId, yearId } = getConfig();

  if (schoolId) {
    payload.headers["schoolId"] = schoolId;
  }
  if (yearId) {
    payload.headers["yearId"] = yearId;
  }

  return payload;
});

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <StoreProvider
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-background">
              <div className="text-sm text-muted-foreground animate-pulse">
                Chargement de la configuration...
              </div>
            </div>
          }
        >
          <QueryProvider>
            <SuspenseErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorPage
                  error={error as Error}
                  onRetry={resetErrorBoundary}
                />
              )}
            >
              <Router />
              <Toaster position="top-center" />
            </SuspenseErrorBoundary>
          </QueryProvider>
        </StoreProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
