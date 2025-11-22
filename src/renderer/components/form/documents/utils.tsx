import { DocumentInfo } from "@/commons/types/services.decuments";

/**
 * Définit la structure d'une option de document avec un regroupement.
 */
export type GroupedDocumentOption = {
    section: string;
    data: DocumentOption[];
};

/**
 * Définit la structure d'une option de document brute.
 */
export type DocumentOption = {
    value: string;
    label: {
        title: string;
        subTitle: string;
    };
};

/**
 * Prépare les options de document pour l'affichage en les regroupant par type de document.
 * @returns Un tableau d'objets, chaque objet représentant un groupe de documents (e.g., "Feuille" ou "Document").
 */
export function getProcessedDocumentOptions(infos: DocumentInfo[] = []): GroupedDocumentOption[] {
    const groupedOptions = infos.reduce((acc, current) => {
        const sectionTitle = current.type === "sheet" ? "Feuilles" : "Documents";

        if (!acc[sectionTitle]) {
            acc[sectionTitle] = { section: sectionTitle, data: [] };
        }

        acc[sectionTitle].data.push({
            value: current.key,
            label: {
                title: current.title,
                subTitle: current.description
            }
        });
        return acc;
    }, {} as Record<string, GroupedDocumentOption>);

    return Object.values(groupedOptions);
}
