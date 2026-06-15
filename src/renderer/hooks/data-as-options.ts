import type {
  ClassroomFilter,
  UserFilter,
} from "@/packages/@core/data-access/schema-validations";
import { useMemo } from "react";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { useGetUsers } from "@/renderer/libs/queries/account";
import { useGetOptions } from "@/renderer/libs/queries/option";
import { useAvailableExports } from "@/renderer/libs/queries/document-export";

// 1. Conventions de nommage claires et types stricts
export interface DataToOptionOptions {
  labelFormat?: "short" | "long" | "both";
}

export interface DefaultOption {
  value: string;
  label: string;
}

// Interface des arguments du hook (plus lisible que le inline)
export interface UseDataToOptionsArgs<
  T,
  R extends DefaultOption = DefaultOption,
> {
  data: T[];
  valueKey: keyof T;
  labelKeyLong: keyof T;
  labelKeyShort: keyof T;
  options?: DataToOptionOptions;
  transformOption?: (baseOption: DefaultOption, originalItem: T) => R;
}

// Valeur par défaut extraite pour éviter les recréations d'objets au render
const DEFAULT_OPTIONS: DataToOptionOptions = { labelFormat: "both" };

export function useDataToOptions<T, R extends DefaultOption = DefaultOption>({
  data,
  valueKey,
  labelKeyLong,
  labelKeyShort,
  options = DEFAULT_OPTIONS,
  transformOption,
}: UseDataToOptionsArgs<T, R>): R[] {
  return useMemo(() => {
    if (!data?.length) return [];

    const { labelFormat } = options;

    return data.map((item): R => {
      const longLabel = String(item[labelKeyLong] ?? "");
      const shortLabel = String(item[labelKeyShort] ?? "");

      const labelFormatters = {
        long: longLabel,
        short: shortLabel,
        both:
          longLabel && shortLabel
            ? `${longLabel} (${shortLabel})`
            : longLabel || shortLabel || "N/A",
      };

      const baseOption: DefaultOption = {
        value: String(item[valueKey] ?? ""),
        label: labelFormatters[labelFormat ?? "both"] || "N/A",
      };

      if (transformOption) {
        return transformOption(baseOption, item);
      }

      return baseOption as unknown as R;
    });
  }, [data, valueKey, labelKeyLong, labelKeyShort, options]);
}
/**
 * Hook pour récupérer les classes et les convertir en un tableau d'options de sélection.
 *
 * @param {ClassroomFilter} params Les paramètres pour filtrer les classes.
 * @param {DataToOptionOptions} [options] Options de formatage du libellé.
 * @returns {Option[]} Un tableau d'options de classe.
 */
export function useGetClassroomAsOptions(
  params: ClassroomFilter,
  options?: DataToOptionOptions,
): DefaultOption[] {
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
 */
export function useGetOptionAsOptions(
  schoolId: string,
  options?: DataToOptionOptions,
) {
  const { data: dataOptions = [] } = useGetOptions({ where: { schoolId } });
  const _options = useDataToOptions({
    data: dataOptions,
    valueKey: "optionId",
    labelKeyLong: "optionName",
    labelKeyShort: "optionShortName",
    options,
  });
  return {
    options: _options,
    data: dataOptions,
  };
}

export function useGetUsersAsOptions(
  params: UserFilter,
  options?: DataToOptionOptions,
): DefaultOption[] {
  const { data: users = [] } = useGetUsers(params);
  return useDataToOptions({
    data: users,
    valueKey: "userId",
    labelKeyLong: "fullName" as any,
    labelKeyShort: "lastName",
    options,
  });
}

export function useGetAvailableExportsAsOptions() {
  const { data } = useAvailableExports();
  return {
    options: data,
    defaultValue: undefined,
    data,
  };
}
