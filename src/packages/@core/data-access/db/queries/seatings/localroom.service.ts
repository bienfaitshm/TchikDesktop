import {
  SelectOptionFacade,
  type SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import { LocalRoomRepository, type BaseLocalRoomFilters } from "./localrooms";
import type { Localroom } from "@/packages/@core/data-access/db/schemas";

export class LocalRoomService {
  public readonly selectService: SelectOptionFacade<Localroom>;

  constructor(private readonly localRoomRepository: LocalRoomRepository) {
    this.selectService = new SelectOptionFacade<Localroom>(
      this.localRoomRepository,
      {
        valueKey: "localroomId",
        labelKeyLong: "name",
        labelKeyShort: "name",
        labelFormat: "long",
      },
    );
  }

  /**
   * Récupère les options formatées pour les listes déroulantes (Select/Combobox)
   * Le typage des filtres est désormais strict et sécurisé.
   */
  async getOptions(args: SearchOptions<BaseLocalRoomFilters>) {
    return this.selectService.loadOptions(args);
  }
}

export const localRoomRepository = new LocalRoomRepository();
export const localRoomService = new LocalRoomService(localRoomRepository);
