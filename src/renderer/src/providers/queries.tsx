import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000
    }
  }
})

export default function QuerieProvider({
  children,
}: React.PropsWithChildren<unknown>): React.ReactNode {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
