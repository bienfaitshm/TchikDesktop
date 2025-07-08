import { ipcRenderer } from "electron"

export type TEndPoint = {
  exportInvoice<DataType, ReponseData>(data: DataType): Promise<ReponseData>
  getItems<T>(): Promise<T>
  getItem<T>(id: string | number): Promise<T>
  createItem<DataType, ResponseType>(data: DataType): Promise<ResponseType>
  updateItem<DataType, ResponseType>(id: string | number, data: DataType): Promise<ResponseType>
  deleteItem<ResponseType>(id: number | string): Promise<ResponseType>
  //
  getInvoices<T>(): Promise<T>
  getInvoice<T>(id: string | number): Promise<T>
  createInvoice<DataType, ResponseType>(data: DataType): Promise<ResponseType>
  updateInvoice<DataType, ResponseType>(id: string | number, data: DataType): Promise<ResponseType>
  deleteInvoice<ResponseType>(id: number | string): Promise<ResponseType>

  // clients
  client: {
    getAll<T>(): Promise<T>
    getById<T>(id: string | number): Promise<T>
    create<DataType, ResponseType>(data: DataType): Promise<ResponseType>
    update<DataType, ResponseType>(id: string | number, data: DataType): Promise<ResponseType>
    delete<ResponseType>(id: number | string): Promise<ResponseType>
  }
  category: {
    getAll<T>(): Promise<T>
    getById<T>(id: string | number): Promise<T>
    create<DataType, ResponseType>(data: DataType): Promise<ResponseType>
    update<DataType, ResponseType>(id: string | number, data: DataType): Promise<ResponseType>
    delete<ResponseType>(id: number | string): Promise<ResponseType>
  }
  product: {
    getAll<T>(): Promise<T>
    getById<T>(id: string | number): Promise<T>
    create<DataType, ResponseType>(data: DataType): Promise<ResponseType>
    update<DataType, ResponseType>(id: string | number, data: DataType): Promise<ResponseType>
    delete<ResponseType>(id: number | string): Promise<ResponseType>
  }
  invoice: {
    getAll<T>(): Promise<T>
    getById<T>(id: string | number): Promise<T>
    create<DataType, ResponseType>(data: DataType): Promise<ResponseType>
    passCommand<DataType, ResponseType>(data: DataType): Promise<ResponseType>
    update<DataType, ResponseType>(id: string | number, data: DataType): Promise<ResponseType>
    delete<ResponseType>(id: number | string): Promise<ResponseType>
  }
  item: {
    getAll<T>(): Promise<T>
    getById<T>(id: string | number): Promise<T>
    create<DataType, ResponseType>(data: DataType): Promise<ResponseType>
    update<DataType, ResponseType>(id: string | number, data: DataType): Promise<ResponseType>
    delete<ResponseType>(id: number | string): Promise<ResponseType>
  }
}

export const apis: TEndPoint = {
  item: {
    getAll: () => ipcRenderer.invoke("items"),
    getById: (id) => ipcRenderer.invoke("item", id),
    create: (data) => ipcRenderer.invoke("item/create", data),
    update: (id, data) => ipcRenderer.invoke("item/update", id, data),
    delete: (id) => ipcRenderer.invoke("item/delete", id)
  },
  invoice: {
    getAll: () => ipcRenderer.invoke("invoices"),
    getById: (id) => ipcRenderer.invoke("invoice", id),
    create: (data) => ipcRenderer.invoke("invoice/create", data),
    passCommand: (data) => ipcRenderer.invoke("invoice/passcommand", data),
    update: (id, data) => ipcRenderer.invoke("invoice/update", id, data),
    delete: (id) => ipcRenderer.invoke("invoice/delete", id)
  },
  client: {
    getAll: () => ipcRenderer.invoke("clients"),
    getById: (id) => ipcRenderer.invoke("client", id),
    create: (data) => ipcRenderer.invoke("client/create", data),
    update: (id, data) => ipcRenderer.invoke("client/update", id, data),
    delete: (id) => ipcRenderer.invoke("client/delete", id)
  },
  category: {
    getAll: () => ipcRenderer.invoke("categories"),
    getById: (id) => ipcRenderer.invoke("category", id),
    create: (data) => ipcRenderer.invoke("category/create", data),
    update: (id, data) => ipcRenderer.invoke("category/update", id, data),
    delete: (id) => ipcRenderer.invoke("category/delete", id)
  },
  product: {
    getAll: () => ipcRenderer.invoke("products"),
    getById: (id) => ipcRenderer.invoke("product", id),
    create: (data) => ipcRenderer.invoke("product/create", data),
    update: (id, data) => ipcRenderer.invoke("product/update", id, data),
    delete: (id) => ipcRenderer.invoke("product/delete", id)
  },
  getItems() {
    return ipcRenderer.invoke("getItems")
  },
  getItem: function <T>(id: string | number): Promise<T> {
    return ipcRenderer.invoke("getItem", id)
  },
  createItem: function <DataType, ResponseType>(data: DataType): Promise<ResponseType> {
    return ipcRenderer.invoke("createItem", data)
  },
  updateItem: function <DataType, ResponseType>(
    id: string | number,
    data: DataType
  ): Promise<ResponseType> {
    return ipcRenderer.invoke("updateItem", id, data)
  },
  deleteItem: function <ResponseType>(id: string | number): Promise<ResponseType> {
    return ipcRenderer.invoke("deleteItem", id)
  },
  exportInvoice: function <DataType, ReponseData>(data: DataType): Promise<ReponseData> {
    return ipcRenderer.invoke("saveInvoice", data)
  },
  getInvoices: function <T>(): Promise<T> {
    return ipcRenderer.invoke("getInvoices")
  },
  getInvoice: function <T>(id: string | number): Promise<T> {
    return ipcRenderer.invoke("getInvoice", id)
  },
  createInvoice: function <DataType, ResponseType>(data: DataType): Promise<ResponseType> {
    return ipcRenderer.invoke("createInvoice", data)
  },
  updateInvoice: function <DataType, ResponseType>(
    id: string | number,
    data: DataType
  ): Promise<ResponseType> {
    return ipcRenderer.invoke("updateInvoice", id, data)
  },
  deleteInvoice: function <ResponseType>(id: string | number): Promise<ResponseType> {
    return ipcRenderer.invoke("deleteInvoice", id)
  }
}
