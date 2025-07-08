import { routePath, Route } from "@main/routes"
import {
  CategorieApiView,
  ClientApiView,
  ProduitQueriesApiView,
  InvoiceApiView,
  ItemApiView
} from "@main/apis/apis"

const route = new Route()

// categories
route.register(routePath("categories", CategorieApiView.getAll))
route.register(routePath("category", CategorieApiView.getById as never))
route.register(routePath("category/create", CategorieApiView.create as never))
route.register(routePath("category/update", CategorieApiView.update as never))
route.register(routePath("category/delete", CategorieApiView.delete as never))

// clients
route.register(routePath("clients", ClientApiView.getAll))
route.register(routePath("client", ClientApiView.getById as never))
route.register(routePath("client/create", ClientApiView.create as never))
route.register(routePath("client/update", ClientApiView.update as never))
route.register(routePath("client/delete", ClientApiView.delete as never))

// products
route.register(routePath("products", ProduitQueriesApiView.getAll))
route.register(routePath("product", ProduitQueriesApiView.getById as never))
route.register(routePath("product/create", ProduitQueriesApiView.create as never))
route.register(routePath("product/update", ProduitQueriesApiView.update as never))
route.register(routePath("product/delete", ProduitQueriesApiView.delete as never))

// invoice
route.register(routePath("invoices", InvoiceApiView.getAll))
route.register(routePath("invoice/passcommand", InvoiceApiView.passCommand as never))
route.register(routePath("invoice", InvoiceApiView.getById as never))
route.register(routePath("invoice/create", InvoiceApiView.create as never))
route.register(routePath("invoice/update", InvoiceApiView.update as never))
route.register(routePath("invoice/delete", InvoiceApiView.delete as never))

// item
route.register(routePath("items", ItemApiView.getAll))
route.register(routePath("item", ItemApiView.getById as never))
route.register(routePath("item/create", ItemApiView.create as never))
route.register(routePath("item/update", ItemApiView.update as never))
route.register(routePath("item/delete", ItemApiView.delete as never))

export default route
