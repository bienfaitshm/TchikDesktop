import { client } from "@/commons/libs/electron-apis/client";

export const clientApis = client.create({
  ipcRender: window.api.ipcRenderer,
});
