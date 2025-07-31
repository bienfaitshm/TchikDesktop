import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1 * 60 * 1000, // Les données ne deviennent jamais obsolètes
            refetchOnWindowFocus: false, // Pas de refetch lors du focus
            refetchOnReconnect: false, // Pas de refetch lors de la reconnexion
            refetchInterval: false, // Pas de refetch périodique
            suspense: true,
        },
    },
})

export default function QuerieProvider({
    children,
}: React.PropsWithChildren<unknown>): React.ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
