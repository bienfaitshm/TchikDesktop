import { SelectOptionFacade } from "@/packages/drizzle-queries";
import { OptionRepository, type BaseOptionFilters } from "./option.repository";

import type { Option } from "@/packages/@core/data-access/db/schemas";
export class OptionService {
  public readonly userSelectService: SelectOptionFacade<Option>;

  constructor(private readonly userRepository: OptionRepository) {
    this.userSelectService = new SelectOptionFacade<Option>(
      this.userRepository,
      {
        valueKey: "optionId",
        labelKeyLong: "optionName",
        labelKeyShort: "optionShortName",
        labelFormat: "long",
      },
    );
  }

  /**
   * Récupère les options formatées pour les listes déroulantes (Select/Combobox)
   * Le typage des filtres est désormais strict et sécurisé.
   */
  async getOptions(args: BaseOptionFilters) {
    return this.userSelectService.loadOptions(args);
  }
}

export const optionRepository = new OptionRepository();
export const optionService = new OptionService(optionRepository);
