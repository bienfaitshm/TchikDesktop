import { TResponse, actionFn } from "@/commons/libs/electron-apis/utils";
import { clientApis } from "./client";

export const getUsers = () => {
  return actionFn(clientApis.get<TResponse<unknown>>("users")).then(
    (res) => res.data
  );
};

export const createUser = (value: { firstName: string; lastName: string }) => {
  return actionFn(clientApis.post<TResponse<unknown>>("users", value)).then(
    (res) => res.data
  );
};
