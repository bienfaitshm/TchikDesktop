import { Status } from "./constant"

export type TResponse<TData = unknown> = {
    data: TData
    message?: string
    status: number
    __func?: boolean
}

export function formatRouteMethodName(name: string, method: string): string {
    return `${name}_${method}`
}

export function response<TData = unknown>(
    data: TData,
    status: number = Status.OK,
    message?: string,
): TResponse<TData> {
    return { data, status, message, __func: true }
}
