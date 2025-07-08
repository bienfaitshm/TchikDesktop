import { ipcMain } from "electron"

type TListner = (event: Electron.IpcMainInvokeEvent, ...args: unknown[]) => unknown
type TPath = { channel: string; listner: TListner }

export interface IRoute {
  routes: TPath[]
  register(path: TPath): void
  getRoutes(): TPath[]
}

export function routePath(channel: string, listner: TListner): TPath {
  return { channel, listner }
}

export class Route implements IRoute {
  routes: TPath[] = []
  //   constructor() {}
  register(path: TPath): void {
    this.routes.push(path)
  }

  getRoutes(): TPath[] {
    return this.routes
  }
}

export class IPC_ROUTE_BINDER {
  /**
   * name
   */
  public static bind(route: Route): void {
    route.getRoutes().forEach((endpoint) => {
      // console.log("IPC_ROUTE_BINDER: ", endpoint)
      ipcMain.handle(endpoint.channel, endpoint.listner)
    })
  }
}
