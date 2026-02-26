import { getDocumentOptions, DOCUMENT_METADATA, DOCUMENT_TYPE } from "@/commons/libs/document";

/**
 * Définit la structure d'une option de document avec un regroupement.
 */
type GroupedDocumentOption = {
    section: string;
    data: DocumentOption[];
};

/**
 * Définit la structure d'une option de document brute.
 */
type DocumentOption = {
    value: DOCUMENT_TYPE;
    label: {
        title: string;
        subTitle: string;
    };
};

/**
 * Prépare les options de document pour l'affichage en les regroupant par type de document.
 * @returns Un tableau d'objets, chaque objet représentant un groupe de documents (e.g., "Feuille" ou "Document").
 */
export function getProcessedDocumentOptions(): GroupedDocumentOption[] {
    const rawOptions = getDocumentOptions();

    const groupedOptions = rawOptions.reduce((acc, current) => {
        const type = DOCUMENT_METADATA[current.value].type;
        const sectionTitle = type === "sheet" ? "Feuilles" : "Documents";

        if (!acc[sectionTitle]) {
            acc[sectionTitle] = { section: sectionTitle, data: [] };
        }

        acc[sectionTitle].data.push(current);
        return acc;
    }, {} as Record<string, GroupedDocumentOption>);

    return Object.values(groupedOptions);
}