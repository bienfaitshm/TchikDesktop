import {
  type BaseFeeAssignmentFilters,
  FeeAssignmentRepository,
  feeAssignmentRepository,
  type FeeAssignmentTDO,
} from "./repository";
import { SelectOptionFacade } from "@/packages/drizzle-queries";

export class FeeAssignmentService {
  public readonly selectOptions: SelectOptionFacade<FeeAssignmentTDO>;

  constructor(
    private readonly feeAssignmentRepo: FeeAssignmentRepository = feeAssignmentRepository,
  ) {
    this.selectOptions = new SelectOptionFacade<FeeAssignmentTDO>(
      this.feeAssignmentRepo,
      {
        valueKey: "assignmentId",
        labelKeyLong: "feeSchedule.installmentName",
        labelKeyShort: "feeSchedule.installmentName",
        labelFormat: "long",
      },
    );
  }

  getOptions(filters?: BaseFeeAssignmentFilters) {
    return this.selectOptions.loadOptions(filters);
  }
}
