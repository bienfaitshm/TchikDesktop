import { QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

export default function QuerieProvider({
  children,
}: React.PropsWithChildren<unknown>): React.ReactNode {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
