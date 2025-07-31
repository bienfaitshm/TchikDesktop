import { server } from "@/camons/libs/electron-apis/server";
import { response } from "@/camons/libs/electron-apis/utils";

import { getSystemInformation } from "@/main/libs/sys-info";

server.get("system-infos", async () => {
  const infos = getSystemInformation();
  return response(infos);
});
