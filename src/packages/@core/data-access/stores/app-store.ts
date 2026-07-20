import Store from "electron-store";

type StoreType = {};

const schema = {
  config: {
    posPrint: {
      host: {
        type: "string",
        default: "localhost",
      },
      port: {
        type: "number",
        default: 9100,
      },
    },
  },
};

export class TchikAppStore {
  constructor(private _store: Store) {}

  getPosPrintConfig(): { host: string; port: string } {
    return {};
  }

  setPostPrintConfig() {}

  getTheme() {}

  setTheme() {}
}

const _store = new Store<StoreType>({ schema });
export const tchikAppStore = new TchikAppStore(_store);
