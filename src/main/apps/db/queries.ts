import { TID } from "@camontype/index"
import { Invoice, Item, Categorie, Client, Produit } from "./config"

/**
 * Categorie queries
 */
export class CategorieQueries {
    // create
    public static async create<DataParams extends Record<string, string>, DataResponse>(
        data: DataParams,
    ): Promise<DataResponse> {
        return (await Categorie.create(data)).toJSON()
    }
    // update
    public static async update<DataParams extends Record<string, string>>(
        id: string | number,
        data: DataParams,
    ): Promise<[affectedCount: number]> {
        return await Categorie.update(data, {
            where: {
                id,
            },
        })
    }
    // delete
    public static async delete(id: number | string): Promise<number> {
        return await Categorie.destroy({
            where: {
                id,
            },
        })
    }
    // get all
    public static async getAll<DataResponse>(): Promise<DataResponse[]> {
        return (await Categorie.findAll()).map((categorie) => categorie.dataValues)
    }
    /**
     * get by id
     */
    public static async getById<DataResponse>(id: number | string): Promise<DataResponse> {
        const item = await Categorie.findOne({
            where: {
                id,
            },
        })
        return item?.dataValues
    }
}

/**
 * Produits queries
 */
export class ProduitQueries {
    // create
    public static async create<DataParams extends Record<string, string>, DataResponse>(
        data: DataParams,
    ): Promise<DataResponse> {
        return (await Produit.create(data)).dataValues
    }
    // update
    public static async update<DataParams extends Record<string, string>>(
        id: string | number,
        data: DataParams,
    ): Promise<[affectedCount: number]> {
        return await Produit.update(data, {
            where: {
                id,
            },
        })
    }
    // delete
    public static async delete(id: number | string): Promise<number> {
        return await Produit.destroy({
            where: {
                id,
            },
        })
    }
    // get all
    public static async getAll<DataResponse>(): Promise<DataResponse[]> {
        return (await Produit.findAll()).map((produit) => produit.toJSON())
    }
    /**
     * get by id
     */
    public static async getById<DataResponse>(
        id: number | string,
    ): Promise<DataResponse | undefined> {
        const item = await Produit.findOne({
            where: {
                id,
            },
        })
        return item?.toJSON()
    }
}

export class ClientQueries {
    // create
    public static async create<DataParams extends Record<string, string>, DataResponse>(
        data: DataParams,
    ): Promise<DataResponse> {
        return (await Client.create(data)).toJSON()
    }

    public static async getOrcreate<
        DataParams extends Record<string, string | number>,
        DataResponse,
    >({ id, ...data }: DataParams & { id?: TID }): Promise<DataResponse> {
        if (id) {
            return await ClientQueries.getById(id)
        }
        return (await Client.create(data)).toJSON()
    }

    // update
    public static async update<DataParams extends Record<string, string>>(
        id: string | number,
        data: DataParams,
    ): Promise<[affectedCount: number]> {
        return await Client.update(data, {
            where: {
                id,
            },
        })
    }
    // delete
    public static async delete(id: number | string): Promise<number> {
        return await Client.destroy({
            where: {
                id,
            },
        })
    }
    // get all
    public static async getAll<DataResponse>(): Promise<DataResponse[]> {
        return (await Client.findAll()).map((client) => client.dataValues)
    }
    /**
     * get by id
     */
    public static async getById<DataResponse>(id: number | string): Promise<DataResponse> {
        const item = await Client.findOne({
            where: {
                id,
            },
        })
        return item?.dataValues
    }
}

export class ItemQuery {
    /**
     * create
     */
    public static async create<DataParams extends Record<string, string | number>, DataResponse>(
        data: DataParams,
    ): Promise<DataResponse> {
        return (await Item.create(data)).toJSON()
    }

    /**
     * bulkCreate
     */
    public static async bulkCreate<
        DataParams extends Record<string, string | number>,
        DataResponse,
    >(data: DataParams[]): Promise<DataResponse[]> {
        return (await Item.bulkCreate(data)).map((item) => item.dataValues)
    }
    public static async update<DataParams extends Record<string, string>>(
        id: string | number,
        data: DataParams,
    ): Promise<[affectedCount: number]> {
        return await Item.update(data, {
            where: {
                id,
            },
        })
    }
    /**
     * name
     */
    public static async getAll<DataResponse>(): Promise<DataResponse[]> {
        const items = await Item.findAll()
        return items.map((item) => item.dataValues)
    }
    /**
     * name
     */
    public static async getById<DataResponse>(id: number | string): Promise<DataResponse> {
        const item = await Item.findOne({
            where: {
                id,
            },
        })
        return item?.dataValues
    }
    public static async delete(id: number | string): Promise<number> {
        return await Item.destroy({
            where: {
                id,
            },
        })
    }
}

export class InvoiceQuery {
    /**
     * create
     */
    public static async create<DataParams extends Record<string, string | number>, DataResponse>(
        data: DataParams,
    ): Promise<DataResponse> {
        return (await Invoice.create(data)).toJSON()
    }

    public static async update<DataParams extends Record<string, string>>(
        id: string | number,
        data: DataParams,
    ): Promise<[affectedCount: number]> {
        return await Invoice.update(data, {
            where: {
                id,
            },
        })
    }
    /**
     * name
     */
    public static async getAll<DataResponse>(): Promise<DataResponse[]> {
        return (await Invoice.findAll()).map((invoice) => invoice.toJSON())
    }
    /**
     * name
     */
    public static async getById<DataResponse>(
        id: number | string,
    ): Promise<DataResponse | undefined> {
        return (
            await Invoice.findOne({
                where: {
                    id,
                },
            })
        )?.toJSON()
    }
    public static async delete(id: number | string): Promise<number> {
        return await Invoice.destroy({
            where: {
                id,
            },
        })
    }
}
