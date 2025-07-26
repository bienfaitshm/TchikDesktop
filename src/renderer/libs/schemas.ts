import z from "zod"

// zod client schemas
export const clientSchemas = z.object({
  nom: z.string().trim(),
  postnom: z.string().trim(),
  prenom: z.string().trim(),
  adress: z.string().trim(),
  contact: z.string()
})

// zod produit schamas
export const categoriesSchemas = z.object({
  nom: z.string().trim(),
  description: z.string().trim()
})

// zod

export const produitSchemas = z.object({
  category: z.union([z.coerce.number(), z.string()]),
  nom: z.string().trim(),
  price: z.coerce.number().min(0),
  tva: z.coerce
    .number()
    .min(0, { message: "la Tva ne doit pas etre negative" })
    .max(100, { message: "La tva depasse 100%" })
})

export const checkoutSchemas = clientSchemas.extend({})

export const invoiceProductSchemas = z.object({
  product: z.string(),
  quantity: z.coerce.number().min(1)
})
