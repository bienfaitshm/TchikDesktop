import { useMutation, UseMutationResult, useQueryClient } from "react-query"
import { TClient, TID, TProduit, TCategory } from "./type"
import { TInvoiceCommand, TDataInvoiceCommand, WithDBValues } from "@camontype/index"

// Client
export function useCreateClient(): UseMutationResult<unknown, unknown, TClient, unknown> {
    return useMutation({
        mutationKey: ["client/create"],
        mutationFn: (values) => window.api.client.create(values),
    })
}

export function useUpdateClient(): UseMutationResult<
    unknown,
    unknown,
    { id: TID } & TClient,
    unknown
> {
    return useMutation({
        mutationKey: ["client/update"],
        mutationFn: ({ id, ...values }) => window.api.client.update(id, values),
    })
}

export function useDeleteClient(): UseMutationResult<unknown, unknown, TID, unknown> {
    return useMutation({
        mutationKey: ["client/delete"],
        mutationFn: (id) => window.api.client.delete(id),
    })
}

// categories
export function useCreateCategory(): UseMutationResult<unknown, unknown, TCategory, unknown> {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["category/create"],
        mutationFn: (values) => window.api.category.create(values),
        onSuccess(data) {
            queryClient.setQueryData<WithDBValues<TCategory>[]>(["categories"], (categories) => [
                ...(categories || []),
                data,
            ])
        },
    })
}

export function useUpdateCategory(): UseMutationResult<
    unknown,
    unknown,
    { id: TID } & TCategory,
    unknown
> {
    return useMutation({
        mutationKey: ["category/update"],
        mutationFn: ({ id, ...values }) => window.api.category.update(id, values),
    })
}

export function useDeleteCategory(): UseMutationResult<unknown, unknown, TID, unknown> {
    return useMutation({
        mutationKey: ["category/delete"],
        mutationFn: (id) => window.api.category.delete(id),
    })
}

// product
export function useCreateProduct(): UseMutationResult<unknown, unknown, TProduit, unknown> {
    return useMutation({
        mutationKey: ["product/create"],
        mutationFn: (values) => window.api.product.create(values),
    })
}

export function useUpdateProduct(): UseMutationResult<
    unknown,
    unknown,
    { id: TID } & TProduit,
    unknown
> {
    return useMutation({
        mutationKey: ["product/update"],
        mutationFn: ({ id, ...values }) => window.api.product.update(id, values),
    })
}

export function useDeleteProduct(): UseMutationResult<unknown, unknown, TID, unknown> {
    return useMutation({
        mutationKey: ["product/delete"],
        mutationFn: (id) => window.api.product.delete(id),
    })
}

// invoice
export function useCreateInvoice(): UseMutationResult<unknown, unknown, TProduit, unknown> {
    return useMutation({
        mutationKey: ["invoice/create"],
        mutationFn: (values) => window.api.invoice.create(values),
    })
}
export function usePassCommadInvoice(): UseMutationResult<
    unknown,
    unknown,
    TInvoiceCommand,
    unknown
> {
    return useMutation({
        mutationKey: ["invoice/passcommand"],
        mutationFn: (values) => window.api.invoice.passCommand(values),
    })
}
export function useUpdateInvoice(): UseMutationResult<
    unknown,
    unknown,
    { id: TID } & TProduit,
    unknown
> {
    return useMutation({
        mutationKey: ["invoice/update"],
        mutationFn: ({ id, ...values }) => window.api.invoice.update(id, values),
    })
}

export function useDeleteInvoice(): UseMutationResult<unknown, unknown, TID, unknown> {
    return useMutation({
        mutationKey: ["invoice/delete"],
        mutationFn: (id) => window.api.invoice.delete(id),
    })
}
