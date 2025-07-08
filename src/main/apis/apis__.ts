import { dialog } from "electron"
import { createPdf } from "../pdf"
type TEndpoints = { name: string; callback: () => Promise<unknown> }

// function appRoute(name: string) {
//   return (...args: unknown[]): void => {
//     console.log("approute ", name, " ", args)
//     return
//   }
// }

class AllData {
  allData(): string {
    console.log("All Data")
    return "alldata"
  }
}

type TUser = { name: string; lastname: string; age: number }
export async function getUser(): Promise<TUser> {
  const data = new AllData()
  console.log("get user", data.allData())
  return { name: "bienfait", lastname: "shomari", age: 13 }
}

const endpoints: TEndpoints[] = [
  {
    name: "getUser",
    callback(): Promise<TUser> {
      return getUser()
    },
  },
  {
    name: "saveFile",
    async callback(): Promise<unknown> {
      const file = await dialog.showSaveDialog({
        title: "Enregistrer un pdf",
        defaultPath: "ListeDesEleves",
        filters: [{ extensions: ["pdf"], name: "Document pdf" }],
      })
      if (!file.canceled) {
        file.filePath && createPdf(file.filePath)
      }
      console.log("Open Dialogue", file)
      return { file }
    },
  },
]
export default endpoints
