import { UseQueryResult } from "react-query"
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { products } from "./data-list/data"
import { TProduct } from "./data-list/type"

const getItems = async (): Promise<TProduct[]> => {
  return products
}
export const useGetItems = (): UseQueryResult<TProduct[], unknown> => {
  return useQuery("items", getItems)
}

export const usePostItem = () => {
  return useMutation("items", (data) => {})
}
