import { ipcMain } from "electron";

// La fonction qui agit comme décorateur de méthode
export function IpcHandle(channel: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // On intercepte et on enregistre automatiquement le handler dans l'IPC Electron
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        return await originalMethod.apply(target, args);
      } catch (error) {
        console.error(`Erreur IPC sur le canal ${channel}:`, error);
        throw error;
      }
    });
  };
}

export class Controller {
  @IpcHandle("fetch-app-version")
  async getVersion() {
    return "1.0.0";
  }

  @IpcHandle("get-user-profile")
  async getUser(userId: string) {
    return { id: userId, name: "Alex", role: "Architecte" };
  }
}
