import { dialog } from "electron"
const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})
/**
 *
 * @param options
 * @param callack
 */
export async function saveFileDialog(
  options: Electron.SaveDialogOptions,
): Promise<Electron.SaveDialogReturnValue> {
  return await dialog.showSaveDialog(options)
}

export function formatCurrency(currency: number): string {
  return USDollar.format(currency)
}
