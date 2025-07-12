import { TResponse, actionFn } from "@/camons/libs/electron-apis/utils";
import { clientApis } from "./client";

export const getConfiguration = () => {
  return actionFn(clientApis.get<TResponse<unknown>>("configuration")).then(
    (res) => res.data
  );
};

export const createConfiguration = (value: { name: string }) => {
  return actionFn(
    clientApis.post<TResponse<unknown>>("configuration", value)
  ).then((res) => res.data);
};
