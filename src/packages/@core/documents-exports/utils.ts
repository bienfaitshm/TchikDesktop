import {
  DATA_REGISTER,
  DOCUMENT_CATEGORY,
  DocumentInfo,
  getDocumentCategory,
  GroupedDocumentOption,
} from "@/commons/constants/file-extension";

/**
 * Prépare les options de document pour l'affichage en les regroupant par catégorie d'extension.
 * @param infos Le tableau des informations de documents.
 * @returns Un tableau d'objets, chaque objet représentant un groupe de documents.
 */
export function getProcessedDocumentOptions(
  infos: DocumentInfo[] = []
): GroupedDocumentOption[] {
  const groupedOptions = infos.reduce(
    (acc, current) => {
      const sectionTitle = getDocumentCategory(current.type);

      if (sectionTitle === DOCUMENT_CATEGORY.UNKNOWN) {
        console.warn(
          `Document with key '${current.key}' and type '${current.type}' has an unknown category and was skipped.`
        );
        return acc;
      }

      if (!acc[sectionTitle]) {
        acc[sectionTitle] = { section: sectionTitle, data: [] };
      }

      acc[sectionTitle].data.push({
        value: current.key,
        label: {
          title: current.title,
          subTitle: current.description,
        },
      });

      return acc;
    },
    {} as Record<DOCUMENT_CATEGORY, GroupedDocumentOption>
  );

  const order = DATA_REGISTER.map((reg) => reg.category);

  return Object.values(groupedOptions).sort(
    (a, b) => order.indexOf(a.section) - order.indexOf(b.section)
  );
}
