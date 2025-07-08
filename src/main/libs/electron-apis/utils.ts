import { Status } from "./constant"

export type TReponse<TData = unknown> = {
    data:TData,
    status:number,
}

export type TFuncReponse<TData = unknown> = TReponse<TData> & { __func?:boolean }

export function formatRouteMethodName(name:string, method:string):string {
    return `${name}_${method}`
}

export function reponse<TData>(data:TData, status:number = Status.OK):(TReponse & {__func?:boolean}){
    return {data,status,__func: true,}
}