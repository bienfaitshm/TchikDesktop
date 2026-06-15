export interface TextTransformation {
  id: string;
  label: string;
  shortcut: string;
  transform: (text: string) => string;
}

export const transformations: TextTransformation[] = [
  {
    id: "uppercase",
    label: "MAJUSCULES",
    shortcut: "u",
    transform: (t) => t.toUpperCase(),
  },
  {
    id: "lowercase",
    label: "minuscules",
    shortcut: "l",
    transform: (t) => t.toLowerCase(),
  },
  {
    id: "titlecase",
    label: "Majuscule Au Début De Chaque Mot",
    shortcut: "t",
    transform: (t) => t.replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    id: "sentencecase",
    label: "Phrase commençant par une majuscule",
    shortcut: "s",
    transform: (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
  },
];
