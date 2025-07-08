type TOption = string
type TGroupe = "PRIMAIRE" | "SECONDAIRE"

export type TClass = {
  option: TOption
  groupe: TGroupe
  name?: string
  degre: number
  getFullName(): string
}
