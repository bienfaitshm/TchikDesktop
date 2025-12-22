/**
 * @file infrastructure.ts
 * @description Point d'entrée de l'infrastructure logicielle.
 * Configure l'exposition des APIs IPC et les services transversaux (Exports).
 */

import {
  instantiatedHandlers,
  EndpointRegistrar,
} from "@/packages/@core/apis/servers";

import { ipcServer } from "./config.ipc.server";

/**
 * Registre des points d'entrée de l'application (Endpoints).
 * * @description
 * Orchestre la liaison entre le serveur IPC (Inter-Process Communication) et
 * les Handlers de domaine. Il expose les fonctions du backend vers le frontend.
 */
export const apiGateway = new EndpointRegistrar(
  ipcServer,
  instantiatedHandlers
);
