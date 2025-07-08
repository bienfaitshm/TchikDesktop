import { useQuery, useMutation, UseQueryResult } from "react-query"

//clients
export function useGetClients<T, D>(): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["clients"],
    queryFn: window.api.client.getAll
  })
}

export function useGetClient<T, D>(id: number | string): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => window.api.client.getById(id)
  })
}

// catgories

export function useGetCategories<T, D>(): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["categories"],
    queryFn: window.api.category.getAll
  })
}

export function useGetCategory<T, D>(id: number | string): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => window.api.category.getById(id)
  })
}

// products
export function useGetProducts<T, D>(): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["products"],
    queryFn: window.api.product.getAll
  })
}

export function useGetProduct<T, D>(id: number | string): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => window.api.product.getById(id)
  })
}

export function useGetItems<T, D>(): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["items"],
    queryFn: window.api.item.getAll
  })
}

export function useGetItem<T, D>(id: number | string): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => window.api.item.getById(id)
  })
}

//
export function useGetInvoices<T, D>(): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: window.api.invoice.getAll
  })
}

export function useGetInvoice<T, D>(id: number | string): UseQueryResult<T, D> {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => window.api.invoice.getById(id)
  })
}

// prev
export function usePostItem(): never {
  return useMutation(window.api.createItem) as never
}

export function usePostInvoice(): never {
  return useMutation(window.api.createInvoice) as never
}
