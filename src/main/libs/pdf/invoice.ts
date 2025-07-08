import PDFDocument from "pdfkit"
import PdfTable from "voilab-pdf-table"
import fs from "fs"
import { TDataInvoiceCommand, WithDBValues } from "@camontype/index"
import { formatCurrency } from "@camons/utils/format"

export type TPdfInvoice = WithDBValues<TDataInvoiceCommand>
export type TCurrancyItems = {
    productName: string
    quantity: string
    unitePrice: string
    total: string
}

export async function createInvoice(
    pathOutput: string,
    { client, items, ...invoice }: TPdfInvoice,
): Promise<void> {
    const clientName = `${client.nom} ${client.postnom} ${client.prenom}`
    const currancyItems: TCurrancyItems[] = items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity.toString(),
        total: formatCurrency(item.totalPrice),
        unitePrice: formatCurrency(item.unitePrice),
    }))
    console.log("Create", currancyItems)
    const doc = new PDFDocument({
        autoFirstPage: false,
        size: "A4",
        margin: 50,
    })

    const table = new PdfTable(doc, {
        // bottomMargin: 50,
    })

    //

    table
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(
            new (require("voilab-pdf-table/plugins/fitcolumn"))({
                column: "productName",
            }),
        )
        // set defaults to your columns
        .setColumnsDefaults({
            align: "right",
        })
        .addColumns([
            {
                id: "productName",
                header: "Produit",
                align: "left",

                // headerBorder: "T",
            },
            {
                id: "quantity",
                header: "Quantity",
                width: 100,
                align: "center",
            },
            {
                id: "unitePrice",
                header: "Prix unitaire",
                width: 100,
                align: "center",
            },
            {
                id: "total",
                header: "Montant",
                width: 100,
            },
        ])
        // add events (here, we draw headers on each new page)
        .onPageAdded(function (tb) {
            tb.addHeader()
        })
    // if no page already exists in your PDF, do not forget to add one
    doc.addPage()
    const margins = doc.page?.margins.left + doc.page?.margins.right
    const width = doc.page.width - margins
    doc.rect(doc.page?.margins.left || 50, doc.page?.margins.top || 50, 70, 70).fill("black")

    doc.fontSize(26).text("MWANGE PHARMA".toUpperCase(), { align: "right" })
    doc.fontSize(10)
        .text("www.bienfaitshomari.com", { align: "right" })
        .text("bienfaitshm@gamil.com", { align: "right" })
    // .text("kilumba shomari", { align: "left" })
    doc.moveDown(3)
    //
    doc.fontSize(18)
        .text("Client".toUpperCase(), { continued: true, width: (width * 4.99) / 5 })
        .text("Facture".toUpperCase(), {
            lineBreak: false,
            width: (width * 0.01) / 3,
            align: "center",
        })
    doc.fontSize(11)
        .text(clientName.toUpperCase(), { continued: true, width: (width * 4.99) / 5 })
        .text(invoice.nInvoice.toUpperCase(), {
            lineBreak: false,
            width: (width * 0.01) / 3,
            align: "center",
        })
    doc.fontSize(11)
        .text(client.adress, { continued: true, width: (width * 4.99) / 5 })
        .text("  ", {
            lineBreak: false,
            width: (width * 0.01) / 3,
            align: "center",
        })
    doc.restore()
    doc.fontSize(12)
    doc.moveDown(4)
    table.addBody(currancyItems)
    doc.restore()
    doc.moveDown()
    doc.fontSize(15).text(`Prix net : ${formatCurrency(invoice.pht)}`)
    doc.moveDown()
    doc.fontSize(15).text(`Tva : ${formatCurrency(invoice.tva)}`)

    doc.moveDown()
    doc.fontSize(15).text(`Total : ${formatCurrency(invoice.total)}`)
    //
    doc.pipe(fs.createWriteStream(pathOutput))
    doc.end()
}
