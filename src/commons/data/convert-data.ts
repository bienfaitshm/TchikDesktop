/**
 * Interface pour définir une correspondance entre une clé d'objet et un libellé.
 * @template TKey Le type de la clé de l'objet source.
 */
export interface Mapping<TKey> {
  key: TKey;
  label: string;
}

/**
 * Convertit un objet en un tableau d'objets structurés, en se basant sur une carte de transformation.
 *
 * Cette fonction est utile pour restructurer des données d'un format clé-valeur vers un
 * format de tableau plus facile à consommer (par exemple, pour l'affichage dans une liste ou un tableau).
 *
 * @template TData - Le type de l'objet source à convertir.
 * @param {TData} sourceObject - L'objet source contenant les données à extraire.
 * @param {Mapping<keyof TData>[]} mappingArray - Le tableau de mappage qui définit les clés à extraire et les libellés correspondants.
 * @returns {(Mapping<keyof TData> & { value: unknown })[]} Un nouveau tableau d'objets, où chaque objet contient la clé, le libellé et la valeur extraite de l'objet source.
 *
 * @example
 * // Exemple d'utilisation
 * const user = {
 * id: 123,
 * name: 'Jane Doe',
 * email: 'jane.doe@example.com'
 * };
 *
 * const userMapping = [
 * { key: 'name', label: 'Nom Complet' },
 * { key: 'email', label: 'Adresse E-mail' }
 * ];
 *
 * const result = convertObjectToArray(user, userMapping);
 * // Le résultat sera :
 * // [
 * //   { key: 'name', label: 'Nom Complet', value: 'Jane Doe' },
 * //   { key: 'email', label: 'Adresse E-mail', value: 'jane.doe@example.com' }
 * // ]
 */
export function convertObjectToArray<TData extends object>(
  sourceObject: TData,
  mappingArray: Mapping<keyof TData>[]
): (Mapping<keyof TData> & { value: unknown })[] {
  return mappingArray.map((item) => ({
    ...item,
    value: sourceObject[item.key],
  }));
}
