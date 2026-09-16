import {
  type BaseFeeOverrideFilters,
  FeeOverrideRepository,
  feeOverrideRepository,
  type FeeOverrideDTO,
} from "./repository";
import { SelectOptionFacade } from "@/packages/drizzle-queries";

/**
 * Service handling business logic and select option formatting for fee overrides.
 */
export class FeeOverrideService {
  public readonly selectOptions: SelectOptionFacade<FeeOverrideDTO>;

  /**
   * Initializes the FeeOverrideService with its repository dependency and UI options facade.
   * @param feeOverrideRepo - Repository instance for fee overrides data access.
   */
  constructor(
    private readonly feeOverrideRepo: FeeOverrideRepository = feeOverrideRepository,
  ) {
    this.selectOptions = new SelectOptionFacade<FeeOverrideDTO>(
      this.feeOverrideRepo,
      {
        valueKey: "feeOverrideId",
        labelKeyLong: "reason",
        labelKeyShort: "reason",
        labelFormat: "long",
      },
    );
  }

  /**
   * Loads formatted select options for fee overrides based on provided filters.
   * @param filters - Optional filters to restrict the fetched options.
   * @returns Promise resolving to formatted select options.
   */
  getOptions(filters?: BaseFeeOverrideFilters) {
    return this.selectOptions.loadOptions(filters);
  }
}

export const feeOverrideService = new FeeOverrideService();
