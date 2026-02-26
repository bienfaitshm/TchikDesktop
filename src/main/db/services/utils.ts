import ShortUniqueId from "short-unique-id";

const shortId = new ShortUniqueId({ length: 5 });
const shortCode = new ShortUniqueId({ length: 10, dictionary: "number" });

export function getDefaultUsername(lenght = 6): string {
  const id = shortId.randomUUID(lenght);
  return `STUDENT_${id}`;
}

export function getDefaultEnrolementCode(lenght = 10) {
  return shortCode.randomUUID(lenght);
}
