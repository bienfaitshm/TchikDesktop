import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type {
  TEnrolement,
  TEnrolementInsert,
  TWithUser,
  TQuickEnrolementInsert,
} from "@/camons/types/services";
import * as apis from "@/renderer/libs/apis/enrolement";

export function useGetEnrolements(params: apis.GetEnrolementParams) {
  return useSuspenseQuery<TWithUser<TEnrolement>[], Error>({
    queryKey: ["GET_ENROLEMENT", params],
    queryFn: () => apis.getEnrolements(params),
  });
}

export function useCreateQuickEnrolement() {
  return useMutation<TEnrolement, Error, TQuickEnrolementInsert>({
    mutationKey: ["QUICK_ENROLEMENT"],
    mutationFn: (data) => apis.quickEnrolement(data),
  });
}

// export function useCreateEnrolement() {
//   return useMutation<TEnrolement, Error, TQuickEnrolementInsert>({
//     mutationKey: ["CREATE_ENROLEMENT"],
//     mutationFn: (data) => apis.createEnrolement(data),
//   });
// }
