export type TID = string | number

// type client
export type TClient = {
  nom: string
  postnom: string
  prenom: string
  adress: string
  contact: string
}

// type Categorie

export type TCategory = {
  nom: string
  description: string
}

// type Produit
export type TProduit = {
  nom: string
  price: number,
  tva:number
}
