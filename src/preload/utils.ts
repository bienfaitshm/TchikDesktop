import { ipcRenderer, IpcRendererEvent } from "electron";
/**
 * Function contract returned by event subscriptions to remove IPC listeners.
 */
export type UnsubscribeFunction = () => void;
/**
 * Subscribes to an IPC channel and returns an unsubscribe cleanup function.
 * @param channel - The target IPC channel name.
 * @param callback - The handler invoked with the received payload.
 * @returns Unsubscribe function removing the registered listener.
 */
export function registerListener<T>(
  channel: string,
  callback: (data: T) => void,
): UnsubscribeFunction {
  const listener = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}
