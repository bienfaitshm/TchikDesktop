const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatCurrency(currency: number): string {
  return USDollar.format(currency)
}
