import { Status, SuccessStatus } from "./constant";

export class ErrorAction<DataError = unknown> extends Error {
  data?: DataError = undefined;
  constructor(message?: string, data?: DataError) {
    super(message);
    this.data = data;
  }
}

export type TResponse<TData = unknown> = {
  data: TData;
  message?: string;
  status: number;
  __func?: boolean;
};

export function formatRouteMethodName(name: string, method: string): string {
  return `${name}_${method}`;
}

export function response<TData = unknown>(
  data: TData,
  status: number = Status.OK,
  message?: string
): TResponse<TData> {
  return { data, status, message, __func: true };
}

export async function actionFn<Data>(value: Promise<TResponse<Data>>) {
  const _handler = await value;
  if (SuccessStatus.includes(_handler.status)) {
    return _handler;
  } else {
    throw new ErrorAction<Data>(_handler.message, _handler.data);
  }
}
