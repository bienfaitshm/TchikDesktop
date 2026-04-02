import { sql } from "drizzle-orm";
import { users } from "../schemas/schema";
import { BaseRepository } from "./base-repository";
import type {
  TUser,
  TUserInsert,
  TUserUpdate,
  FindManyOptions,
} from "../schemas/types";

/**
 * Tri standard : Nom, Post-nom, Prénom (Case-Insensitive)
 */
const USER_DEFAULT_SORT = {
  orderBy: [
    { column: sql`lower(${users.lastName})`, order: "asc" },
    { column: sql`lower(${users.middleName})`, order: "asc" },
    { column: sql`lower(${users.firstName})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof users>;

export class UserQuery extends BaseRepository<
  typeof users,
  TUser,
  TUserInsert,
  TUserUpdate
> {
  constructor() {
    super(users, users.userId, "User", USER_DEFAULT_SORT);
  }

  // /**
  //  * findMany avec logique de filtrage par "Inscriptions"
  //  * On surcharge pour gérer la jointure conditionnelle.
  //  */
  // async findManyExtended({
  //   yearId,
  //   classroomId,
  //   ...filters
  // }: any): Promise<TUser[]> {
  //   // Sécurité : Isolation par école (Tenant Isolation)
  //   if (!filters.schoolId) {
  //     throw new Error("Validation Error: schoolId is required.");
  //   }

  //   try {
  //     const query = db.select().from(users).$dynamic();

  //     // Logique de jointure si filtrage par contexte scolaire
  //     if (yearId || classroomId) {
  //       query.innerJoin(
  //         classroomEnrolements,
  //         eq(users.userId, classroomEnrolements.studentId),
  //       );

  //       const conditions = [];
  //       if (yearId) {
  //         conditions.push(
  //           Array.isArray(yearId)
  //             ? inArray(classroomEnrolements.yearId, yearId)
  //             : eq(classroomEnrolements.yearId, yearId)
  //         );
  //       }
  //       if (classroomId) {
  //         conditions.push(
  //           Array.isArray(classroomId)
  //             ? inArray(classroomEnrolements.classroomId, classroomId)
  //             : eq(classroomEnrolements.classroomId, classroomId)
  //         );
  //       }
  //       query.where(and(...conditions));
  //     }

  //     // Utilisation du helper centralisé pour les filtres restants (role, name, etc.)
  //     return await applyQueryOptions(query, users, filters);
  //   } catch (error) {
  //     this.logError("findManyExtended", error, { yearId, classroomId, ...filters });
  //     throw new Error("Impossible de récupérer la liste des utilisateurs.");
  //   }
  // }

  static instance = new UserQuery();
}

export const userService = UserQuery.instance;
