import type {
  Wallet,
  FeeType,
  FeeSchedule,
} from "@/packages/@core/data-access/db";
import {
  WalletRepository,
  FeeTypeRepository,
  FeeScheduleRepository,
  type BaseWalletOptionFilters,
  type BaseFeeScheduleOptionFilters,
  type BaseFeeTypeOptionFilters,
} from "./repository";
import { SelectOptionFacade } from "@/packages/drizzle-queries";

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

  getOptions(args?: BaseWalletOptionFilters) {
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

  getOptions(args?: BaseFeeTypeOptionFilters) {
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

  getOptions(args?: BaseFeeScheduleOptionFilters) {
    return this.selectOptions.loadOptions(args);
  }
}

export const feeScheduleService = new FeeScheduleService();
