import {
  SelectOptionFacade,
  type SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import type {
  Wallet,
  FeeType,
  FeeSchedule,
} from "@/packages/@core/data-access/db";
import {
  WalletRepository,
  FeeTypeRepository,
  FeeScheduleRepository,
  type WalletOptionFilters,
  type FeeScheduleOptionFilters,
  type FeeTypeOptionFilters,
} from "./repository";

export class WalletService extends WalletRepository {
  public readonly selectOptions: SelectOptionFacade<Wallet>;

  constructor() {
    super();
    this.selectOptions = new SelectOptionFacade<Wallet>(this, {
      valueKey: "walletId",
      labelKeyLong: "name",
      labelKeyShort: "name",
      labelFormat: "long",
    });
  }

  async getOptions(args: SearchOptions<WalletOptionFilters>) {
    return this.selectOptions.loadOptions(args);
  }
}

export const walletService = new WalletService();

export class FeeTypeService extends FeeTypeRepository {
  public readonly selectOptions: SelectOptionFacade<FeeType>;

  constructor() {
    super();
    this.selectOptions = new SelectOptionFacade<FeeType>(this, {
      valueKey: "feeTypeId",
      labelKeyLong: "name",
      labelKeyShort: "name",
      labelFormat: "long",
    });
  }

  async getOptions(args: SearchOptions<FeeTypeOptionFilters>) {
    return this.selectOptions.loadOptions(args);
  }
}

export const feeTypeService = new FeeTypeService();

export class FeeScheduleService extends FeeScheduleRepository {
  public readonly selectOptions: SelectOptionFacade<FeeSchedule>;

  constructor() {
    super();
    this.selectOptions = new SelectOptionFacade<FeeSchedule>(this, {
      valueKey: "scheduleId",
      labelKeyLong: "installmentName",
      labelKeyShort: "installmentName",
      labelFormat: "long",
    });
  }

  async getOptions(args: SearchOptions<FeeScheduleOptionFilters>) {
    return this.selectOptions.loadOptions(args);
  }
}

export const feeScheduleService = new FeeScheduleService();
