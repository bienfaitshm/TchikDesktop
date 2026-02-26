import type { TOptionInsert, TOption } from "@/commons/types/services";
import { clientApis } from "./client";

// --- Client Actions for Options ---

/**
 * @function getOptions
 * @description Client action to retrieve all options for a given school.
 */
export const getOptions = (schoolId: string) => {
  return clientApis
    .get<TOption[]>("options", {
      params: { schoolId },
    })
    .then((res) => res.data);
};

/**
 * @function createOption
 * @description Client action to create a new option.
 */
export const createOption = (data: TOptionInsert) => {
  return clientApis
    .post<TOption, TOptionInsert>("options", data)
    .then((res) => res.data);
};

/**
 * @function updateOption
 * @description Client action to update an existing option.
 */
export const updateOption = (
  optionId: string,
  data: Partial<TOptionInsert>
) => {
  return clientApis
    .put<
      TOption,
      Partial<TOptionInsert>
    >("options/:optionId", data, { params: { optionId } })
    .then((res) => res.data);
};

/**
 * @function deleteOption
 * @description Client action to delete an option.
 */
export const deleteOption = (optionId: string) => {
  return clientApis
    .delete<{ message: string }>("options/:optionId", {
      params: { optionId },
    })
    .then((res) => res.data);
};
