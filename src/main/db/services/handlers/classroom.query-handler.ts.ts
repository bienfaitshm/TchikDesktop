/**
 * @file classroom.query-handler.ts
 * @description Handler concret pour récupérer les salles de classe et leurs inscriptions.
 * Implémente le pipeline standard de validation, exécution DB, et transformation finale.
 */

import { Model } from "sequelize";
import type {
  TClassroom,
  TWithUser,
  TEnrolement,
} from "@/commons/types/models";
import { AbstractDataQueryHandler } from "./data-query-handler";
import * as queries from "./classroom";
import * as schemas from "./schemas.classroom";
import { mapRawEnrollmentsToReportStructure } from "../utils/parsers";
import { z } from "zod";

// ==========================================
// 1. Types Spécifiques à la Requête
// ==========================================

/** * 📝 Type des paramètres de filtrage Zod (TParams).
 * Utilisation du schéma pour la définition des types.
 */
type ClassroomFilterParams = z.infer<typeof schemas.DocumentExportSchema>;

/**
 * 💾 Type des données brutes de l'ORM (TData).
 * Représente une Salle de Classe incluant ses Inscriptions (élèves).
 */
export type RawClassroomWithEnrollments = TClassroom & {
  ClassroomEnrolements: TWithUser<TEnrolement>[];
};

/**
 * 📊 Type de la donnée finale après transformation/nettoyage (TPlainPayload).
 * Le format de rapport final après l'exécution de `mapRawEnrollmentsToReportStructure`.
 * (Utiliser `any` ici s'il n'y a pas de type de rapport connu, mais un type strict est préféré)
 */
export type EnrollmentReportStructure = any;

// ==========================================
// 2. Implémentation du Query Handler
// ==========================================

/**
 * 🚀 Handler : Récupère les salles de classe correspondant aux filtres, y compris
 * les inscriptions détaillées des élèves, et les mappe au format de rapport final.
 */
export class ClassroomEnrollmentQueryHandler extends AbstractDataQueryHandler<
  typeof schemas.DocumentExportSchema,
  EnrollmentReportStructure[]
> {
  /** Identifiant unique de la requête, utilisé par le Query Bus. */
  public readonly queryId: string = "classrooms.enrollments";

  /** Schéma Zod pour la validation des paramètres d'entrée. */
  public readonly schema = schemas.DocumentExportSchema;

  /**
   * @inheritdoc
   * Implémente la logique d'accès à la base de données (Sequelize).
   */
  public async execute(
    validatedParams: ClassroomFilterParams
  ): Promise<Model<any, any> | Model<any, any>[]> {
    // La fonction de requête DB
    return queries.fetchClassroomsWithEnrollments(validatedParams);
  }

  /**
   * @override
   * Surcharge de la méthode de transformation finale (anciennement `cleanData`).
   * Cette méthode est appelée APRÈS le mapping ORM -> POJO.
   */
  protected transformPayload(
    data: RawClassroomWithEnrollments[]
  ): EnrollmentReportStructure[] {
    // Utiliser la fonction de parsing métier pour la transformation finale des données
    return mapRawEnrollmentsToReportStructure(data);
  }
}
