import { ipcMain } from "electron";
import Store from 'electron-store';
import { ELECTRON_STORAGE_ROUTE_ACTION, ELECTRON_STORAGE_ROUTE } from "./constant"
import type { DataStorage } from "./types";



export class ElectronStorage {
    ipcMain: Electron.IpcMain
    localStorage: Store<Record<string, unknown>>
    constructor(ipcMain: Electron.IpcMain, localStorage: Store<Record<string, unknown>>) {
        this.ipcMain = ipcMain
        this.localStorage = localStorage
    }

    actionStorage(action:ELECTRON_STORAGE_ROUTE_ACTION){
        return {
           [ ELECTRON_STORAGE_ROUTE_ACTION.getItem]: this.localStorage.,
           [ELECTRON_STORAGE_ROUTE_ACTION.removeItem]: any,
            [ELECTRON_STORAGE_ROUTE_ACTION.setItem]: any,
        }
    }
    public init(){
        this.ipcMain.handle(ELECTRON_STORAGE_ROUTE, (data: DataStorage)=>{
            const action  =  this.actionStorage(data.action)

        })
    }
}

const store = new Store();
store.openInEditor
const electronStorage = new ElectronStorage(ipcMain, store)

export default electronStorage