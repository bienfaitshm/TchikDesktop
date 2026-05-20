export type TQueryUpdate<TData> = { id: string; data: Partial<TData> };
export type TQueryCreateParams<TData, TParams> = {
  params: TParams;
  data: TData;
};
