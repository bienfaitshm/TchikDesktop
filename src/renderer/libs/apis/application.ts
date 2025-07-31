import { TResponse, actionFn } from "@/camons/libs/electron-apis/utils";
import { SystemInformation } from "@/camons/types/sys-infos";

import { clientApis } from "./client";

export const getSystemInfos = () => {
  return actionFn(
    clientApis.get<TResponse<SystemInformation>>("system-infos")
  ).then((res) => res.data);
};
