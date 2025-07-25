import * as models from "@/main/db/models";
import { mapModelsToPlainList, mapModelToPlain } from "./utils";

/**
 * Retrieves all users from the database.
 * @returns A promise resolving to a list of user attributes.
 */
export async function getUsers(): Promise<models.UserAttributes[]> {
  const users = await models.User.findAll();
  return mapModelsToPlainList(users) as Promise<models.UserAttributes[]>;
}

/**
 * Creates a new user in the database.
 * @param userData - The data for the new user (excluding the ID).
 * @returns A promise resolving to the created user's attributes.
 */
export async function createUser(
  userData: Omit<models.UserAttributes, "id">
): Promise<models.UserAttributes> {
  const user = await models.User.create(userData);
  return mapModelToPlain(user) as Promise<models.UserAttributes>;
}

/**
 * Retrieves a user by their unique identifier.
 * @param userId - The ID of the user to retrieve.
 * @returns A promise resolving to the user's attributes, or null if not found.
 */
export async function getUserById(
  userId: number
): Promise<models.UserAttributes | null> {
  const user = await models.User.findByPk(userId);
  return user ? ((await mapModelToPlain(user)) as models.UserAttributes) : null;
}

/**
 * Retrieves a user by their email address.
 * @param email - The email address of the user to retrieve.
 * @returns A promise resolving to the user's attributes, or null if not found.
 */
export async function getUserByEmail(
  email: string
): Promise<models.UserAttributes | null> {
  const user = await models.User.findOne({ where: { email } });
  return user ? ((await mapModelToPlain(user)) as models.UserAttributes) : null;
}

/**
 * Assigns a role to a user.
 * @param userId - The ID of the user.
 * @param roleId - The ID of the role to assign.
 * @returns A promise resolving to true if the role was assigned, false otherwise.
 */
export async function assignRoleToUser(
  userId: number,
  roleId: number
): Promise<boolean> {
  try {
    const user = await models.User.findByPk(userId);
    const role = await models.Role.findByPk(roleId);

    if (user && role) {
      // `addRole` is a Sequelize-generated method for many-to-many associations
      await (user as any).addRole(role);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Retrieves all users along with their associated roles.
 * @returns A promise resolving to a list of users with their roles.
 */
export async function getUsersWithRoles(): Promise<models.UserAttributes[]> {
  const users = await models.User.findAll({
    include: [
      {
        model: models.Role,
        through: { attributes: [] }, // Exclude junction table attributes
      },
    ],
  });
  return mapModelsToPlainList(users) as Promise<models.UserAttributes[]>;
}
