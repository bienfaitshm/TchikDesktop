export interface BaseQuery {
  create<DataParams extends Record<string, string>, DataResponse>(
    data: DataParams
  ): Promise<DataResponse>
  update<DataParams extends Record<string, string>>(
    id: string | number,
    data: DataParams
  ): Promise<[affectedCount: number]>
  delete(id: number | string): Promise<number>
  // get all
  getAll<DataResponse>(): Promise<DataResponse[]>
  getById<DataResponse>(id: number | string): Promise<DataResponse>
}
