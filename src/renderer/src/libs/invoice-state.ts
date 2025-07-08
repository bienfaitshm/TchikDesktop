import { create } from "zustand"

interface TInvoiceProduct {
    id: number | string
    productName: string
    quantity: number
    unitePrice: number
    totalPrice: number
    pht: number
    tva: number
}

type TValues<TProduct> = {
    products: TProduct[]
    total: number
    tva: number
    pht: number
}

type TInvoiceState<T> = {
    products: T[]
    tva: number
    pht: number
    total: number
    getValues(): TValues<T>
    addProduct(product: T): void
    removeProduct(id: string | number): void
    updateProduct(product: T): void
    resetCommand(): void
    // utils methods
    _filterProduct(id: number | string): T[]
    _getProduct(id: number | string): T | undefined
    _updateProduct(product: T): T[]
    _mergeProduct(product: T): T & { merged?: boolean }
}

export const useInvoiceState = create<TInvoiceState<TInvoiceProduct>>()((set, get) => ({
    pht: 0,
    tva: 0,
    total: 0,
    products: [],
    resetCommand() {
        set({ pht: 0, tva: 0, products: [] })
    },
    getValues() {
        const { total, tva, pht, products } = get()
        return {
            total,
            tva,
            pht,
            products,
        }
    },
    addProduct(product) {
        const { merged, ...newProduct } = get()._mergeProduct(product)
        set({
            total: get().total + product.totalPrice,
            pht: get().pht + product.pht,
            tva: get().tva + product.tva,
            products: merged ? get()._updateProduct(newProduct) : [...get().products, newProduct],
        })
    },
    removeProduct(id) {
        const product = get()._getProduct(id)
        set({
            total: get().total - (product?.totalPrice || 0),
            pht: get().pht - (product?.pht || 0),
            tva: get().tva - (product?.tva || 0),
            products: get()._filterProduct(id),
        })
    },
    updateProduct(product) {
        set({ products: get()._updateProduct(product) })
    },
    _filterProduct(id) {
        return get().products.filter((product) => product.id !== id)
    },
    _getProduct(id) {
        return get().products.find((product) => product.id == id)
    },
    _updateProduct(product) {
        return get().products.map((_product) => (_product.id == product.id ? product : _product))
    },
    _mergeProduct(product) {
        const existedProduct = get()._getProduct(product.id)
        console.log({ existedProduct, product })
        if (existedProduct) {
            return {
                ...existedProduct,
                quantity: product.quantity + existedProduct.quantity,
                pht: product.pht + existedProduct.pht,
                tva: product.tva + existedProduct.tva,
                totalPrice: product.totalPrice + existedProduct.totalPrice,
                merged: true,
            }
        } else {
            return product
        }
    },
}))

export function formatComputedProduct({
    id,
    nom,
    price,
    quantity,
    tva,
}: {
    id: number | string
    tva: number
    price: number
    nom: string
    quantity: number
}): TInvoiceProduct {
    const pht = quantity * price
    const _tva = (tva * pht) / 100
    return {
        id,
        pht,
        quantity,
        productName: nom,
        tva: _tva,
        unitePrice: price,
        totalPrice: pht + _tva,
    }
}
