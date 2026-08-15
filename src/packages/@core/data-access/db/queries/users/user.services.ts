import { SelectOptionFacade } from "@/packages/drizzle-queries";
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
        transform: (option, item) => ({
          ...option,
          description: `sexe :${item.gender}`,
          ...item,
        }),
      },
    );
  }

  /**
   * Récupère les options formatées pour les listes déroulantes (Select/Combobox)
   * Le typage des filtres est désormais strict et sécurisé.
   */
  async getOptions(args: BaseUserFilters) {
    return this.userSelectService.loadOptions(args);
  }
}

export const userRepository = new UserRepository();
export const userService = new UserService(userRepository);
