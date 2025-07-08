import { Sequelize, DataTypes } from "sequelize"
import { cumputeTvaCurrancy } from "@camons/utils/camputed"

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "main/db/database.sqlite",
})

/**
 * Db table Clients
 */
export const Client = sequelize.define("Client", {
    nom: {
        type: DataTypes.STRING,
    },
    postnom: {
        type: DataTypes.STRING,
    },
    prenom: {
        type: DataTypes.STRING,
    },
    adress: {
        type: DataTypes.STRING,
    },
    contact: {
        type: DataTypes.STRING,
    },
    fullName: {
        type: DataTypes.VIRTUAL,
        get() {
            return `${this.getDataValue("nom")} ${this.getDataValue("prenom")} ${this.getDataValue(
                "postnom",
            )}`
        },
    },
})

/**
 * db table Categories
 */

export const Categorie = sequelize.define("Category", {
    nom: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
})

/**
 * table Produit
 */
export const Produit = sequelize.define("Product", {
    nom: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.NUMBER,
    },
    tva: {
        type: DataTypes.NUMBER,
    },
    tvaCurrancy: {
        type: DataTypes.VIRTUAL,
        get() {
            return cumputeTvaCurrancy(this.getDataValue("price"), this.getDataValue("tva"))
        },
    },
    totalPrice: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getDataValue("price") + this.getDataValue("tvaCurrancy")
        },
    },
})

/**
 *
 */
export const Item = sequelize.define("Item", {
    productName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unitePrice: {
        type: DataTypes.NUMBER,
    },
    totalPrice: {
        type: DataTypes.NUMBER,
    },
    tva: {
        type: DataTypes.NUMBER,
    },
    pht: {
        type: DataTypes.NUMBER,
    },
    quantity: {
        type: DataTypes.NUMBER,
    },
})

export const Invoice = sequelize.define("Invoice", {
    nInvoice: {
        type: DataTypes.STRING,
    },
    total: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
    },
    pht: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
    },
    tva: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
    },
})

// Associations Category to Product
Categorie.hasMany(Produit, { foreignKey: "category" })
Produit.belongsTo(Categorie)

// Associations invoice to client
Client.hasMany(Invoice, { foreignKey: "client" })
Invoice.belongsTo(Client)

// Association Item commanded to invoice
Invoice.hasMany(Item, { foreignKey: "invoice" })
Item.belongsTo(Invoice)

// Association Item commanded to Product
Produit.hasMany(Item, { foreignKey: "product" })
Item.belongsTo(Produit)

export async function syncDataBase(): Promise<void> {
    sequelize
        .sync({})
        .then(() => {
            console.log("Connected ")
        })
        .catch((e) => {
            console.log("Error Database ", e)
        })
}
