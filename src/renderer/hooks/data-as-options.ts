import { useMemo } from "react";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { GetClassroomParams } from "@/commons/types/services";
import { useGetOptions } from "@/renderer/libs/queries/option";

/**
 * Définit les options de formatage pour la conversion de données en options de sélection.
 */
interface DataToOptionConverterOptions {
  /**
   * Spécifie le format du libellé de l'option :
   * - 'long': utilise uniquement la désignation longue (ex: 'Première Année').
   * - 'short': utilise uniquement la désignation courte (ex: '1A').
   * - 'both': (par défaut) combine les deux désignations (ex: 'Première Année (1A)').
   */
  labelFormat?: "short" | "long" | "both";
}

/**
 * Type générique pour une option de sélection standard.
 */
type Option = {
  value: string;
  label: string;
};

/**
 * Type générique pour un élément de donnée, assurant qu'il peut être indexé par clé.
 */
type DataItem = { [key: string]: any };

/**
 * Hook générique pour convertir une liste de données en un tableau d'options de sélection.
 * Cela permet de réutiliser la logique de mappage et de formatage des libellés.
 *
 * @template T L'interface des objets de données dans le tableau d'entrée.
 * @param {object} args Les arguments pour la conversion.
 * @param {T[]} args.data Le tableau de données à convertir.
 * @param {keyof T} args.valueKey La clé de l'objet de données à utiliser comme valeur de l'option.
 * @param {keyof T} args.labelKeyLong La clé de l'objet de données pour le libellé long.
 * @param {keyof T} args.labelKeyShort La clé de l'objet de données pour le libellé court.
 * @param {DataToOptionConverterOptions} [args.options] Options de formatage du libellé.
 * @returns {Option[]} Un tableau d'objets { value: string, label: string }.
 */
export function useDataToOptions<T extends DataItem>({
  data,
  valueKey,
  labelKeyLong,
  labelKeyShort,
  options = { labelFormat: "both" },
}: {
  data: T[];
  valueKey: keyof T;
  labelKeyLong: keyof T;
  labelKeyShort: keyof T;
  options?: DataToOptionConverterOptions;
}): Option[] {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((item) => {
      const longLabel = String(item[labelKeyLong] || "");
      const shortLabel = String(item[labelKeyShort] || "");
      let labelText = "";

      switch (options.labelFormat) {
        case "long":
          labelText = longLabel;
          break;
        case "short":
          labelText = shortLabel;
          break;
        case "both":
        default:
          labelText =
            longLabel && shortLabel
              ? `${longLabel} (${shortLabel})`
              : longLabel || shortLabel || "N/A";
          break;
      }

      return {
        value: String(item[valueKey]),
        label: labelText,
      };
    });
  }, [data, valueKey, labelKeyLong, labelKeyShort, options.labelFormat]);
}

/**
 * Hook pour récupérer les classes et les convertir en un tableau d'options de sélection.
 *
 * @param {GetClassroomParams} params Les paramètres pour filtrer les classes.
 * @param {DataToOptionConverterOptions} [options] Options de formatage du libellé.
 * @returns {Option[]} Un tableau d'options de classe.
 */
export function useGetClassroomAsOptions(
  params: GetClassroomParams,
  options?: DataToOptionConverterOptions
): Option[] {
  const { data: classrooms = [] } = useGetClassrooms(params);

  return useDataToOptions({
    data: classrooms,
    valueKey: "classId",
    labelKeyLong: "identifier",
    labelKeyShort: "shortIdentifier",
    options,
  });
}

/**
 * Hook pour récupérer les options (académiques) et les convertir en un tableau d'options de sélection.
 *
 * @param {string} schoolId L'ID de l'école pour laquelle récupérer les options.
 * @param {DataToOptionConverterOptions} [options] Options de formatage du libellé.
 * @returns {Option[]} Un tableau d'options académiques.
 */
export function useGetOptionAsOptions(
  schoolId: string,
  options?: DataToOptionConverterOptions
): Option[] {
  const { data: dataOptions = [] } = useGetOptions(schoolId);

  return useDataToOptions({
    data: dataOptions,
    valueKey: "optionId",
    labelKeyLong: "optionName",
    labelKeyShort: "optionShortName",
    options,
  });
}
