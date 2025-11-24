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
  // Utilisation de Record<DOCUMENT_CATEGORY, ...> pour une meilleure sécurité des types pour l'accumulateur.
  const groupedOptions = infos.reduce(
    (acc, current) => {
      // Détermine la catégorie du document en utilisant l'extension
      const sectionTitle = getDocumentCategory(current.type);

      // Si la catégorie est UNKNOWN, on ignore l'élément pour éviter de créer une section indésirable
      if (sectionTitle === DOCUMENT_CATEGORY.UNKNOWN) {
        console.warn(
          `Document with key '${current.key}' and type '${current.type}' has an unknown category and was skipped.`
        );
        return acc;
      }

      // 1. Initialise le groupe si nécessaire
      if (!acc[sectionTitle]) {
        acc[sectionTitle] = { section: sectionTitle, data: [] };
      }

      // 2. Ajoute l'option au groupe
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

  // Renvoie les valeurs de l'objet de regroupement sous forme de tableau
  // On utilise Object.values() car l'ordre des catégories est mieux défini dans DATA_REGISTER,
  // mais la fonction reduce garantit que seules les catégories utilisées sont renvoyées.

  // Pour garantir un ordre fixe (l'ordre défini dans DATA_REGISTER), on peut trier les groupes:
  const order = DATA_REGISTER.map((reg) => reg.category);

  return Object.values(groupedOptions).sort(
    (a, b) => order.indexOf(a.section) - order.indexOf(b.section)
  );
}
