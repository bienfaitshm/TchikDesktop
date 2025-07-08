import { IToast, INotify } from "@main/types"

export class Toast implements IToast {
  success(): void {
    throw new Error("Method not implemented.")
  }
  warn(): void {
    throw new Error("Method not implemented.")
  }
  info(): void {
    throw new Error("Method not implemented.")
  }
  error(): void {
    throw new Error("Method not implemented.")
  }
}

/**
 *
 */
export class Notify implements INotify {
  error(): void {
    throw new Error("Method not implemented.")
  }
  success(): void {
    throw new Error("Method not implemented.")
  }
  warn(): void {
    throw new Error("Method not implemented.")
  }
  info(): void {
    throw new Error("Method not implemented.")
  }
}
