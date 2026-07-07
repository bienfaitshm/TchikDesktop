import {
  SelectOptionFacade,
  type SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import type { FeeConfiguration } from "@/packages/@core/data-access/db";
import {
  FeeConfigurationRepository,
  type FeeConfigurationFilters,
} from "./repository";

export class FeeConfigurationService extends FeeConfigurationRepository {
  public readonly selectOptions: SelectOptionFacade<FeeConfiguration>;

  constructor() {
    super();
    this.selectOptions = new SelectOptionFacade<FeeConfiguration>(this, {
      valueKey: "feeConfigId",
      labelKeyLong: "name",
      labelKeyShort: "name",
      labelFormat: "long",
    });
  }

  async getOptions(args: SearchOptions<FeeConfigurationFilters>) {
    return this.selectOptions.loadOptions(args);
  }
}

export const feeConfigurationService = new FeeConfigurationService();
