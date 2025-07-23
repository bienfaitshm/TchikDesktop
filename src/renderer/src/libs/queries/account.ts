import { useMutation, useQuery } from "@tanstack/react-query";
import { createUser, getUsers } from "@/renderer/libs/apis/account";

export function useGetUsers() {
  return useQuery({
    queryKey: ["GET_USER"],
    queryFn: () => getUsers(),
  });
}

export function useCreateUser() {
  // const client = useQueryClient();
  return useMutation({
    mutationKey: ["CREATE_USER"],
    mutationFn: (value: { firstName: string; lastName: string }) =>
      createUser(value),
    onSuccess() {},
  });
}
