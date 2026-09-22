import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools";

/**
 * Shared React Query client instance configured with default query behavior.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provides the React Query context and renders development tools in development mode.
 * @param props - Component props containing React children.
 * @returns The provider wrapper component tree.
 */
export default function QueryProvider({
  children,
}: QueryProviderProps): React.ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />
        </>
      )}
    </QueryClientProvider>
  );
}
