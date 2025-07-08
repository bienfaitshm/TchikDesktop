export type TID = string | number
export type WithDBValues<DataType> = {
  id: TID
  createdAt: Date
  updatedAt: Date
} & DataType
// type Categorie

export type TCategory = {
  nom: string
  description: string
}

// type Produit
export type TProduit = {
  nom: string
  price: number
  tva: number
}
export type TClient = {
  nom: string
  postnom: string
  prenom: string
  adress: string
  contact: string
}

export type TItem = {
  productName: string
  unitePrice: number
  totalPrice: number
  tva: number
  pht: number
  quantity: number
  invoice: TID
  product: TID
}

export type TInvoice = {
  nInvoice: string
  total: number
  pht: number
  tva: number
  client: TID
}

export type TProductCommand = { id: TID } & Omit<TItem, "invoice" | "product">

export type TInvoiceCommandOptions = {
  exportToPdf: boolean
}
export type TInvoiceCommand = {
  client: { id?: TID } & TClient
  command: Omit<TInvoice, "nInvoice" | "client"> & { products: TProductCommand[] }
  options?: Partial<TInvoiceCommandOptions>
}
export type TDataInvoiceCommand = Omit<TInvoice, "client"> & {
  client: WithDBValues<TClient>
  items: WithDBValues<TItem>[]
}
export type InvoiceCreateData = {
  recipient: string
  invoiceNumber: string
  totalAmount: string
  items: {
    quantity: number
    designation: {
      id: string | number
      code: string
      name: string
      price: number
      tva: number
    }
    totalPrice: string
    unitePrice: string
  }[]
}
