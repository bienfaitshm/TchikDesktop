import {
  SelectOptionFacade,
  type SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import {
  UserRepository,
  type UserDTO,
  type BaseUserFilters,
} from "./user.repository";

export class UserService {
  public readonly userSelectService: SelectOptionFacade<UserDTO>;

  constructor(private readonly userRepository: UserRepository) {
    this.userSelectService = new SelectOptionFacade<UserDTO>(
      this.userRepository,
      {
        valueKey: "userId",
        labelKeyLong: "fullName",
        labelKeyShort: "lastName",
        labelFormat: "long",
      },
    );
  }

  /**
   * Récupère les options formatées pour les listes déroulantes (Select/Combobox)
   * Le typage des filtres est désormais strict et sécurisé.
   */
  async getOptions(args: SearchOptions<BaseUserFilters>) {
    return this.userSelectService.loadOptions(args);
  }
}

export const userRepository = new UserRepository();
export const userService = new UserService(userRepository);
