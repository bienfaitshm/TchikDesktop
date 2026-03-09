import { AbstractQueryHandler } from "@/packages/data-system";
import { ClassroomQuery } from "@/packages/@core/data-access/db/queries";
import {
  ClassroomFilterSchema,
  ClassroomAttributesSchema,
  type TClassroomFilter,
  type TClassroomAttributes,
} from "@/packages/@core/data-access/schema-validations";
import { ClassroomIds } from "./route-ids";
// import { mapRawEnrollmentsToReportStructure } from "../utils/parsers";

/**
 * 🚀 Handler : Récupère une liste paginée/filtrée de salles de classes.
 * @queryId "classroom.find.all"
 */
export class FindSchoolsQueryHandler extends AbstractQueryHandler<TClassroomFilter> {
  public readonly queryId: string = ClassroomIds.findAllClassrooms;
  public readonly schema = ClassroomFilterSchema;

  public async execute(validatedParams: TClassroomFilter) {
    return ClassroomQuery.findMany(validatedParams) as any;
  }
}

/**
 * 🚀 Handler : Récupère une seule école par son ID primaire.
 * @queryId "school.find.byId"
 */
export class FindClassroomByIdQueryHandler extends AbstractQueryHandler<
  Pick<TClassroomAttributes, "classId">
> {
  public readonly queryId: string = ClassroomIds.findClassroomById;
  public readonly schema = ClassroomAttributesSchema.pick({ classId: true });

  public async execute(validatedParams: Pick<TClassroomAttributes, "classId">) {
    return ClassroomQuery.findById(validatedParams.classId) as any;
  }
}

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
export class ClassroomEnrollmentQueryHandler extends AbstractQueryHandler<TClassroomFilter> {
  /** Identifiant unique de la requête, utilisé par le Query Bus. */
  public readonly queryId: string =
    ClassroomIds.findAllClassroomsWithEnrollment;

  /** Schéma Zod pour la validation des paramètres d'entrée. */
  public readonly schema = ClassroomFilterSchema;

  /**
   * @inheritdoc
   * Implémente la logique d'accès à la base de données (Sequelize).
   */
  public async execute(validatedParams: TClassroomFilter) {
    // La fonction de requête DB
    return ClassroomQuery.findWithEnrollments(validatedParams) as any;
  }

  /**
   * @override
   * Surcharge de la méthode de transformation finale (anciennement `cleanData`).
   * Cette méthode est appelée APRÈS le mapping ORM -> POJO.
   */
  // protected transformPayload(
  //   data: RawClassroomWithEnrollments[]
  // ): EnrollmentReportStructure[] {
  //   // Utiliser la fonction de parsing métier pour la transformation finale des données
  //   return mapRawEnrollmentsToReportStructure(data);
  // }
}
