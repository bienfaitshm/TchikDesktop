export interface IRoute {
  register(): void
  routes(): { channel: string; listner: Electron.IpcMainInvokeEvent; args?: any[] }
}
