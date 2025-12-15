import { IpcClient } from "@/packages/electron-ipc-rest";
import {
  createClassroomApis,
  createEnrollementApis,
  createOptionApis,
  createSchoolApis,
  ClassroomApi,
  EnrollementApi,
  OptionApi,
  SchoolApi,
} from "@/packages/@core/apis/clients";
import type { IpcRenderer } from "@electron-toolkit/preload";

/**
 * Interface définissant la structure complète de tous les clients API de l'application.
 * Ceci sert de contrat pour tous les modules consommant les services de données.
 */
export interface AppClients {
  /** Client API pour la gestion des Salles de Classe (CRUD). */
  readonly classroom: ClassroomApi;
  /** Client API pour la gestion des Inscriptions (Enrollements). */
  readonly enrollement: EnrollementApi;
  /** Client API pour la gestion des Options/Filières. */
  readonly option: OptionApi;
  /** Client API pour la gestion des Écoles et Années Académiques. */
  readonly school: SchoolApi;
}

/**
 * Initialise et compose tous les clients d'API de l'application en utilisant le client IPC.
 *
 * Cette Factory centralise la création de toutes les couches de données front-end,
 * garantissant que toutes partagent la même instance de communication IPC.
 *
 * @param ipcRendererInstance L'instance du renderer IPC (e.g., window.electron.ipcRenderer)
 * pour établir la communication avec le processus principal.
 * @returns Un objet AppClients contenant toutes les interfaces d'API initialisées.
 */
function initializeAppClients(ipcRendererInstance: IpcRenderer): AppClients {
  // 1. Création du client de transport unique
  const ipcClient = new IpcClient(ipcRendererInstance);

  // 2. Composition de l'objet Clients en injectant le client de transport
  const clients: AppClients = {
    classroom: createClassroomApis(ipcClient),
    enrollement: createEnrollementApis(ipcClient),
    option: createOptionApis(ipcClient),
    school: createSchoolApis(ipcClient),
  };

  // Utilisation du 'as const' pour garantir l'immutabilité des propriétés
  return clients as AppClients;
}

/**
 * Ensemble des clients d'API de l'application, initialisés et prêts à l'emploi.
 *
 * Ces exports sont utilisés par les couches de logique métier (services, stores, etc.)
 * pour interagir avec les données via la communication Inter-Processus (IPC).
 */
export const { classroom, enrollement, option, school } = initializeAppClients(
  window.electron.ipcRenderer
);
