import { ipcRenderer } from "electron"

export type TEndPoint = {
    ipcRenderer: typeof ipcRenderer
}

export const apis: TEndPoint = {
    ipcRenderer,
}
