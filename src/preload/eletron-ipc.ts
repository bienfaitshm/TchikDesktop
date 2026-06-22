import { ipcRenderer } from "electron";

export const customIpcRenderer = {
  send(channel: string, ...args: any[]) {
    ipcRenderer.send(channel, ...args);
  },
  sendSync(channel: string, ...args: any[]) {
    return ipcRenderer.sendSync(channel, ...args);
  },
  invoke(channel: string, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args);
  },
  on(channel: string, listener: (...args: any[]) => void) {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  once(channel: string, listener: (...args: any[]) => void) {
    ipcRenderer.once(channel, listener);
  },
  removeListener(channel: string, listener: (...args: any[]) => void) {
    ipcRenderer.removeListener(channel, listener);
  },
  removeAllListeners(channel: string) {
    ipcRenderer.removeAllListeners(channel);
  },
};
