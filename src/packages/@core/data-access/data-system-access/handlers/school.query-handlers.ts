// school.query-handlers.ts
import {
  SchoolFilterSchema,
  SchoolAttributesSchema,
  StudyYearAttributesSchema,
  StudyYearFilterSchema,
  type TSchoolFilter,
  type TStudyYearFilter,
  type TSchoolAttributes,
  type TStudyYearAttributes,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractQueryHandler } from "@/packages/data-system";
import {
  SchoolQuery,
  StudyYearQuery,
} from "@/packages/@core/data-access/db/queries";

import { ShoolRouteIds } from "./route-ids";

/**
 * 🚀 Handler : Récupère une liste paginée/filtrée d'écoles.
 * @queryId "school.find.all"
 */
export class FindSchoolsQueryHandler extends AbstractQueryHandler<TSchoolFilter> {
  public readonly queryId: string = ShoolRouteIds.findAllSchools;
  public readonly schema = SchoolFilterSchema;

  public async execute(validatedParams: TSchoolFilter) {
    return SchoolQuery.findMany(validatedParams) as any;
  }
}

// ==========================================
// 2. HANDLER : Récupérer une école par ID (FIND BY ID)
// ==========================================

/**
 * 🚀 Handler : Récupère une seule école par son ID primaire.
 * @queryId "school.find.byId"
 */
export class FindSchoolByIdQueryHandler extends AbstractQueryHandler<
  Pick<TSchoolAttributes, "schoolId">
> {
  public readonly queryId: string = ShoolRouteIds.findSchoolById;
  public readonly schema = SchoolAttributesSchema.pick({ schoolId: true });

  public async execute(validatedParams: Pick<TSchoolAttributes, "schoolId">) {
    return SchoolQuery.findById(validatedParams.schoolId) as any;
  }
}

// ==========================================
// 3. HANDLER : Récupérer les années d'études pour une école
// ==========================================

/**
 * 🚀 Handler : Récupère les années d'études pour une école donnée.
 * @queryId "school.studyYears.find.all"
 */
export class FindStudyYearsQueryHandler extends AbstractQueryHandler<TStudyYearFilter> {
  public readonly queryId: string = ShoolRouteIds.findAllSchoolYears;
  public readonly schema = StudyYearFilterSchema;

  public async execute(validatedParams: TStudyYearFilter) {
    return StudyYearQuery.findMany(validatedParams) as any;
  }
}

// ==========================================
// 4. HANDLER : Récupérer l'année d'études par ID pour une école
// ==========================================

/**
 * 🚀 Handler : Récupère l'année d'études pour une école donnée.
 * @queryId "school.studyYears.find.byId"
 */
export class FindStudyYearByIdQueryHandler extends AbstractQueryHandler<
  Pick<TStudyYearAttributes, "yearId">
> {
  public readonly queryId: string = ShoolRouteIds.findStudyYearById;
  public readonly schema = StudyYearAttributesSchema.pick({ yearId: true });

  public async execute(validatedParams: Pick<TStudyYearAttributes, "yearId">) {
    return StudyYearQuery.findById(validatedParams.yearId) as any;
  }
}
