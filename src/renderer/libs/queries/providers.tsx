import {
  QueryClient,
  QueryClientProvider,
  useQueryClient as useTSQueryClient,
} from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools";

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

export const useQueryClient = () => {
  return useTSQueryClient(queryClient);
};

// if (process.env.NODE_ENV !== 'production') {
//   window.TANSTACK_QUERY_CLIENT = queryClient;
// }

export default function QueryProvider({
  children,
}: React.PropsWithChildren<unknown>): React.ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />
    </QueryClientProvider>
  );
}
