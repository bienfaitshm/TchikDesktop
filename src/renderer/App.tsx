import type { JSX } from "react";
import { useEffect } from "react";
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

/**
 * Configures global API request interceptors to inject tenant headers.
 */
function setupApiInterceptors(): void {
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
}

setupApiInterceptors();

/**
 * Removes the initial native HTML splash screen with a fade-out animation once loaded.
 * @returns Null as it renders no visual DOM nodes.
 */
function SplashRemover(): null {
  useEffect(() => {
    const splashElement = document.getElementById("splash-screen");
    if (!splashElement) return;

    splashElement.classList.add("fade-out");

    const handleTransitionEnd = (): void => {
      splashElement.remove();
    };

    splashElement.addEventListener("transitionend", handleTransitionEnd, {
      once: true,
    });

    return () => {
      splashElement.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []);

  return null;
}

/**
 * Root component orchestrating global providers, stores, boundary handling, and routing.
 * @returns The rendered React application tree.
 */
function App(): JSX.Element {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <StoreProvider
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-background">
              <div className="animate-pulse text-sm text-muted-foreground">
                Loading configuration...
              </div>
            </div>
          }
        >
          <SplashRemover />
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
