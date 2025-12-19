import {
  instantiatedHandlers,
  EndpointRegistrar,
} from "@/packages/@core/apis/servers";

import { ipcServer } from "./ipc-server";

export const appEndpoints = new EndpointRegistrar(
  ipcServer,
  instantiatedHandlers
);
