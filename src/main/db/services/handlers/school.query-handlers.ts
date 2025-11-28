// school.query-handlers.ts

import { Model } from "sequelize";
import { AbstractDataQueryHandler } from "./data-query-handler";
import * as schemas from "./school.schemas";
import { SchoolRepository, StudyYearRepository } from "./school";
import type { TSchool, TStudyYear } from "@/commons/types/models";
import z from "zod";

// --- Dépendances Repositories (Simplification pour l'exemple) ---
// En production, ces Repositories seraient injectés dans le constructeur, mais pour la simplicité,
// nous les instancions ici ou les considérons comme des Singletons si les méthodes sont statiques.
const schoolRepository = new SchoolRepository();
const studyYearRepository = new StudyYearRepository();

// ==========================================
// 1. HANDLER : Récupérer toutes les écoles (FIND ALL)
// ==========================================

// TParams : Paramètres de filtrage (optionnels)
type FindSchoolsParams = z.infer<typeof schemas.GetSchoolsParamsSchema>;
// TPlainPayload : Tableau d'objets POJO (TSchool)
type SchoolPayload = TSchool[];

/**
 * 🚀 Handler : Récupère une liste paginée/filtrée d'écoles.
 * @queryId "school.find.all"
 */
export class FindSchoolsQueryHandler extends AbstractDataQueryHandler<
  typeof schemas.GetSchoolsParamsSchema,
  SchoolPayload
> {
  public readonly queryId: string = "school.find.all";
  public readonly schema = schemas.GetSchoolsParamsSchema;

  public async execute(
    validatedParams: FindSchoolsParams
  ): Promise<Model<any, any>[]> {
    // Appel du Repository pour la logique DB
    // On mappe le format d'entrée du Query Handler à l'appel du Repository
    return schoolRepository.findSchools({ params: validatedParams });
  }

  // Le mapping ORM -> POJO est géré par la classe abstraite.
  // La méthode transformPayload n'est pas nécessaire ici car le résultat est brut.
}

// ==========================================
// 2. HANDLER : Récupérer une école par ID (FIND BY ID)
// ==========================================

// TParams : ID unique
type FindSchoolByIdParams = z.infer<typeof schemas.SchoolDetailParamSchema>;
// TPlainPayload : Un seul objet TSchool (ou null)
// type SingleSchoolPayload = TSchool | null;

/**
 * 🚀 Handler : Récupère une seule école par son ID primaire.
 * @queryId "school.find.byId"
 */
export class FindSchoolByIdQueryHandler extends AbstractDataQueryHandler<
  typeof schemas.SchoolDetailParamSchema,
  any
> {
  public readonly queryId: string = "school.find.byId";
  public readonly schema = schemas.SchoolDetailParamSchema;

  public async execute(
    validatedParams: FindSchoolByIdParams
  ): Promise<Model<any, any> | Model<any, any>[]> {
    // Si l'exécution trouve un seul élément, il est retourné tel quel.
    return schoolRepository.findSchoolById(validatedParams.schoolId) as any;
  }
}

// ==========================================
// 3. HANDLER : Récupérer les années d'études pour une école
// ==========================================

// TParams : schoolId est obligatoire
type FindStudyYearsParams = z.infer<typeof schemas.GetStudyYearsParamsSchema>;
// TPlainPayload : Tableau d'objets TStudyYear
type StudyYearPayload = TStudyYear[];

/**
 * 🚀 Handler : Récupère les années d'études pour une école donnée.
 * @queryId "school.studyYears.find.all"
 */
export class FindStudyYearsQueryHandler extends AbstractDataQueryHandler<
  typeof schemas.GetStudyYearsParamsSchema,
  StudyYearPayload
> {
  public readonly queryId: string = "school.studyYears.find.all";
  public readonly schema = schemas.GetStudyYearsParamsSchema;

  public async execute(
    validatedParams: FindStudyYearsParams
  ): Promise<Model<any, any>[]> {
    // Séparation des paramètres
    const { schoolId, ...filterParams } = validatedParams;

    // Appel du Repository
    return studyYearRepository.findStudyYears(schoolId, filterParams);
  }
}
