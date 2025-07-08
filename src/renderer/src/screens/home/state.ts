import { create } from "zustand"
import { getAmountTVA, getAmountTotalWithTVA, totalAmount } from "@renderer/utils/camputed-value"
import { TProduct } from "@renderer/screens/products/data-list/type"

export type TItem = {
  id?: string | number
  quantity: number
  unitePrice: string
  totalPrice: string
  designation: TProduct
}

export type TInvoiceState = {
  recipient: string
  items: TItem[]
  reset(): void
  addItem(item: TItem): void
  removeItem(id: TItem["id"]): void
  onChangeRecipient(e: string): void
}

const intialState: Pick<TInvoiceState, "recipient" | "items"> = {
  recipient: "",
  items: [],
}
export const useInvoiceState = create<TInvoiceState>((set, get) => ({
  ...intialState,
  reset(): void {
    set(intialState)
  },
  addItem(item): void {
    set({ items: [...get().items, item] })
  },
  removeItem(id): void {
    set({ items: get().items.filter((i) => i.id !== id) })
  },
  onChangeRecipient(e): void {
    set({ recipient: e })
  },
}))

export const useTotal = (): number => {
  const items = useInvoiceState((state) => state.items)
  return totalAmount(
    items.map((item) => ({
      quantity: item.quantity,
      price: getAmountTotalWithTVA(
        item.designation.price,
        getAmountTVA(item.designation.price, item.designation.tva),
      ),
    })),
  )
}
