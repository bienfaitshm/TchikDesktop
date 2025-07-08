import { IpcMainInvokeEvent } from "electron"
import { saveFileDialog } from "@main/utils"
import { createInvoice } from "@main/pdf/invoice"
import {
    InvoiceQuery,
    ItemQuery,
    CategorieQueries,
    ClientQueries,
    ProduitQueries,
} from "@main/db/queries"
import {
    TInvoiceCommand,
    WithDBValues,
    TClient,
    TInvoice,
    TItem,
    TDataInvoiceCommand,
} from "@camontype/index"
import { getRadomString } from "@camons/utils"

export async function exportInvoice(data: WithDBValues<TDataInvoiceCommand>): Promise<void> {
    // console.log("EXPORT_INVOICE", event)
    const filePath = await saveFileDialog({
        title: "Enregistrer un pdf",
        defaultPath: `invoice-${data.client.nom}-${data.nInvoice}`,
        filters: [{ extensions: ["pdf"], name: "Document pdf" }],
    })
    if (filePath.canceled || !filePath.filePath) {
        return
    }
    filePath.filePath && createInvoice(filePath.filePath, data)
}

// InvoiceCommand
export class InvoiceCommand {
    /**
     * passCommand
     */
    public static async passCommand(): Promise<void> {
        console.log(this)
    }
}
// Categories

export class CategorieApiView {
    /**
     * getItems
     */
    public static async getAll<T>(): Promise<T[]> {
        return await CategorieQueries.getAll<T>()
    }
    /**
     * get By ID
     */
    public static async getById<T>(_: IpcMainInvokeEvent, id: number | string): Promise<T> {
        return await CategorieQueries.getById<T>(id)
    }

    /**
     * getItems
     */
    public static async create<DataType extends Record<string, string>, ReponseType>(
        _: IpcMainInvokeEvent,
        data: DataType,
    ): Promise<ReponseType> {
        return CategorieQueries.create<DataType, ReponseType>(data)
    }
    public static async update<DataType extends Record<string, string>>(
        _: IpcMainInvokeEvent,
        id: number | string,
        data: DataType,
    ): Promise<unknown> {
        return await CategorieQueries.update(id, data)
    }
    public static async delete(id: string): Promise<number> {
        return await CategorieQueries.delete(id)
    }
}

// Client

export class ClientApiView {
    /**
     * getItems
     */
    public static async getAll<T>(): Promise<T[]> {
        return await ClientQueries.getAll<T>()
    }
    /**
     * get By ID
     */
    public static async getById<T>(_: IpcMainInvokeEvent, id: number | string): Promise<T> {
        return await ClientQueries.getById<T>(id)
    }

    /**
     * getItems
     */
    public static async create<DataType extends Record<string, string>, ReponseType>(
        _: IpcMainInvokeEvent,
        data: DataType,
    ): Promise<ReponseType> {
        return ClientQueries.create<DataType, ReponseType>(data)
    }
    public static async update<DataType extends Record<string, string>>(
        _: IpcMainInvokeEvent,
        id: number | string,
        data: DataType,
    ): Promise<unknown> {
        return await ClientQueries.update(id, data)
    }
    public static async delete(id: string): Promise<number> {
        return await ClientQueries.delete(id)
    }
}

// Produit

export class ProduitQueriesApiView {
    /**
     * getItems
     */
    public static async getAll<T>(): Promise<T[]> {
        return await ProduitQueries.getAll<T>()
    }
    /**
     * get By ID
     */
    public static async getById<T>(
        _: IpcMainInvokeEvent,
        id: number | string,
    ): Promise<T | undefined> {
        return await ProduitQueries.getById<T>(id)
    }

    /**
     * getItems
     */
    public static async create<DataType extends Record<string, string>, ReponseType>(
        _: IpcMainInvokeEvent,
        data: DataType,
    ): Promise<ReponseType> {
        return ProduitQueries.create<DataType, ReponseType>(data)
    }
    public static async update<DataType extends Record<string, string>>(
        _: IpcMainInvokeEvent,
        id: number | string,
        data: DataType,
    ): Promise<unknown> {
        return await ProduitQueries.update(id, data)
    }
    public static async delete(id: string): Promise<number> {
        return await ProduitQueries.delete(id)
    }
}

// Item

export class ItemApiView {
    /**
     * getItems
     */
    public static async getAll<T>(): Promise<T[]> {
        return await ItemQuery.getAll<T>()
    }
    /**
     * getItems
     */
    public static async getById<T>(_: IpcMainInvokeEvent, id: number | string): Promise<T> {
        return await ItemQuery.getById<T>(id)
    }

    /**
     * getItems
     */
    public static async create<DataType extends Record<string, string>, ReponseType>(
        _: IpcMainInvokeEvent,
        data: DataType,
    ): Promise<ReponseType> {
        return ItemQuery.create<DataType, ReponseType>(data)
    }
    public static async update<DataType extends Record<string, string>>(
        _: IpcMainInvokeEvent,
        id: number | string,
        data: DataType,
    ): Promise<unknown> {
        return await ItemQuery.update(id, data)
    }
    public static async delete(id: string): Promise<number> {
        return await ItemQuery.delete(id)
    }
}

export class InvoiceApiView {
    /**
     * getItems
     */
    public static async getAll<T>(): Promise<T[]> {
        return await InvoiceQuery.getAll<T>()
    }
    /**
     * getItems
     */
    public static async getById<T>(
        _: IpcMainInvokeEvent,
        id: number | string,
    ): Promise<T | undefined> {
        return await InvoiceQuery.getById<T>(id)
    }

    /**
     * passCommand
     */
    public static async passCommand<DataType extends TInvoiceCommand>(
        _: IpcMainInvokeEvent,
        { client: dataClient, command, options }: DataType,
    ): Promise<WithDBValues<TDataInvoiceCommand>> {
        const nInvoice = getRadomString()
        const client = await ClientQueries.getOrcreate<TClient, WithDBValues<TClient>>(dataClient)
        const invoice = await InvoiceQuery.create<TInvoice, WithDBValues<TInvoice>>({
            nInvoice,
            pht: command.pht,
            total: command.total,
            tva: command.tva,
            client: client.id,
        })

        const items = await ItemQuery.bulkCreate<TItem, WithDBValues<TItem>>(
            command.products.map(({ id, ...rest }) => ({
                ...rest,
                product: id,
                invoice: invoice.id,
            })),
        )

        const _command: WithDBValues<TDataInvoiceCommand> = {
            ...invoice,
            client,
            items,
        }
        if (options?.exportToPdf) {
            await exportInvoice(_command)
        }
        console.log("Commad", JSON.stringify(_command, null, 4))
        return _command
    }
    public static async create<DataType extends Record<string, string>, ReponseType>(
        _: IpcMainInvokeEvent,
        data: DataType,
    ): Promise<ReponseType> {
        return InvoiceQuery.create<DataType, ReponseType>(data)
    }
    public static async update<DataType extends Record<string, string>>(
        _: IpcMainInvokeEvent,
        id: number | string,
        data: DataType,
    ): Promise<unknown> {
        return await InvoiceQuery.update(id, data)
    }
    public static async delete(id: string): Promise<number> {
        return await InvoiceQuery.delete(id)
    }
}
