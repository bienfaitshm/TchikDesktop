export interface INotify {
  error(): void
  success(): void
  warn(): void
  info(): void
}
export interface IToast {
  error(): void
  success(): void
  warn(): void
  info(): void
}
export interface ExternalApisType {
  get(): void
  post(): void
  delete(): void
  patch(): void
}
/**
 *
 */
export type ContextType = {
  notify: INotify
  toast: IToast
  externalApis: ExternalApisType
}
