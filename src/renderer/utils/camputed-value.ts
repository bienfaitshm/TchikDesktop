export function getAmountTVA(tva: number, amount: number): number {
  return Math.round((tva * amount) / 100)
}

export function getAmountTotalWithTVA(price: number, tvaAmount: number): number {
  return price + tvaAmount
}

export function totalAmount(items: { quantity: number; price: number }[]): number {
  return items
    .map((item) => item.price * item.quantity)
    .reduce((prev, current) => prev + current, 0)
}
