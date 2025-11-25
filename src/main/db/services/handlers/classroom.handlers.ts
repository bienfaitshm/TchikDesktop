import { Model } from "sequelize";
import { getLogger } from "@/main/libs/logger";
import type {
  TClassroom,
  TWithUser,
  TEnrolement,
} from "@/commons/types/models";

import { BaseQueryHandler } from "./handler";
import * as queries from "./classroom";

/**
 * 🧱 Interface des paramètres de filtrage génériques.
 * Renommé en `ClassroomFilterParams` pour être plus spécifique.
 */
export interface ClassroomFilterParams {
  schoolId?: string;
  yearId?: string;
  sections?: string | string[];
  classrooms?: string | string[];
}

/**
 * 📝 Type de données de retour pour une Salle de Classe incluant ses Inscriptions (élèves).
 * Combine le type de base TClassroom avec l'inclusion de TEnrolement typé TWithUser.
 */
export type ClassroomWithEnrollments = TClassroom & {
  ClassroomEnrolements: TWithUser<TEnrolement>[];
};

/**
 * 💾 Récupère toutes les salles de classe correspondantes aux filtres, y compris
 * les inscriptions et les détails de l'utilisateur (élève).
 *
 * @name "classrooms.enrollments"
 * @param params Les paramètres de filtrage (schoolId, yearId, sections, classrooms).
 * @returns Une Promise résolue avec un tableau d'objets `ClassroomWithEnrollments`.
 */
export class ClassroomEnrollmentQueryHandler extends BaseQueryHandler {
  public queryName: string = "classrooms.enrollments";
  public schema: any = {};
  public logger = getLogger("ClassroomEnrollment");
  public executeQueryset(
    validatedParams: ClassroomFilterParams
  ): Promise<Model<any, any> | Model<any, any>[]> {
    return queries.fetchClassroomsWithEnrollments(validatedParams);
  }
}
