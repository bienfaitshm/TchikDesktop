import { TResponse } from "@/commons/libs/electron-apis/utils";
import { clientApis } from "./client";
import { TUserInsert } from "@/commons/types/models";
import { QueryParams, WithSchoolAndYearId } from "@/commons/types/services";

export const getUsers = (
  params?: QueryParams<
    WithSchoolAndYearId,
    Partial<TUserInsert & { classroomId: string }>
  >
) => {
  return clientApis.get("users", { params }).then((res) => res.data);
};

export const createUser = (data: TUserInsert) => {
  return clientApis
    .post<TResponse<unknown>>("users", data)
    .then((res) => res.data);
};

export const updateUser = (userId: string, data: Partial<TUserInsert>) => {
  return clientApis
    .put("users/:userId", data, { params: { userId } })
    .then((res) => res.data);
};

export const deleteUser = (userId: string) => {
  return clientApis
    .delete("users/:userId", { params: { userId } })
    .then((res) => res.data);
};
