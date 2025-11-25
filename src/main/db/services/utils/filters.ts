/**
 * @typedef TStudent
 * @property {string} [fullname] - Le nom complet de l'étudiant, optionnel.
 * * @template {TStudent} TStudent - Le type d'objet étudiant, qui doit inclure la propriété 'fullname' (ou l'hériter).
 */

/**
 * @function sortStudentsByFullName
 * @description Trie un tableau d'objets étudiants par leur nom complet (`fullname`)
 * par ordre alphabétique croissant (ASC).
 * * Cette fonction crée et retourne une copie triée du tableau original (principe d'immuabilité).
 * Elle gère les cas où l'objet étudiant ou le nom complet sont manquants.
 *
 * @template TStudent
 * @param {TStudent[]} students - Le tableau des objets étudiants à trier.
 * @returns {TStudent[]} Un nouveau tableau trié par nom complet.
 */
export function sortStudentsByFullName<
  TStudent extends { fullname?: string; fullName?: string },
>(students: TStudent[]): TStudent[] {
  // 1. Créer une copie du tableau pour garantir l'immuabilité et la pureté de la fonction.
  const sortedStudents = [...students];

  // 2. Utiliser la méthode sort
  return sortedStudents.sort((a, b) => {
    // 3. Extraction et sécurisation des noms pour éviter les erreurs de référence et les valeurs nulles.
    // Vérifie que 'a' et 'b' existent, puis utilise le nom complet, sinon chaîne vide.
    const nameA = a?.fullname || a.fullName || "";
    const nameB = b?.fullname || b.fullName || "";

    // 4. Utilisation de localeCompare pour un tri alphabétique correct (gestion des accents, etc.).
    // Le résultat est 1, -1 ou 0 pour le tri ASC.
    return nameA.localeCompare(nameB);
  });
}
