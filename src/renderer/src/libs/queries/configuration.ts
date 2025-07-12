import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createConfiguration,
  getConfiguration,
} from "@/renderer/libs/apis/configuration";

export function useGetConfiguration() {
  return useQuery({
    queryKey: ["GET_CONFIGURATION"],
    queryFn: () => getConfiguration(),
  });
}

export function useCreateConfiguration() {
  // const client = useQueryClient();
  return useMutation({
    mutationKey: ["CREATE_MUTATION"],
    mutationFn: (value: { name: string }) => createConfiguration(value),
    onSuccess() {},
  });
}
