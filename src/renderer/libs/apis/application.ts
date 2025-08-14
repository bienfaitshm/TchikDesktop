import { TResponse, actionFn } from "@/commons/libs/electron-apis/utils";
import { SystemInformation } from "@/commons/types/sys-infos";

import { clientApis } from "./client";

export const getSystemInfos = () => {
  return actionFn(
    clientApis.get<TResponse<SystemInformation>>("system-infos")
  ).then((res) => res.data);
};
