/**
 * Generates a unique point-of-sale tracking reference code.
 * @param year - Reference calendar year for the invoice prefix.
 * @returns Formatted unique tracking reference identifier.
 */
export const generateInvoiceRef = (year = new Date().getFullYear()): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = new Uint8Array(4);

  if (
    typeof globalThis.crypto !== "undefined" &&
    globalThis.crypto.getRandomValues
  ) {
    globalThis.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 4; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const randomPart = Array.from(randomBytes)
    .map((byte) => chars[byte % chars.length])
    .join("");

  return `POS-${year}-${randomPart}`;
};
