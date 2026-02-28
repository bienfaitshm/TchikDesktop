import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "./abstract";
import { StatsRoutes } from "../routes-constant";
import { StatsService } from "@/packages/@core/data-access/data-queries";
import {
  StatsFilterSchema,
  TStatsFilter,
} from "@/packages/@core/data-access/schema-validations";

/**
 * Endpoint pour obtenir le résumé global (KPIs)
 */
export class GetStatsSummary extends AbstractEndpoint<any> {
  route = StatsRoutes.SUMMARY;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: StatsFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TStatsFilter>): Promise<unknown> {
    return StatsService.getQuickKpis(params.schoolId, params.yearId);
  }
}

/**
 * Endpoint pour la répartition par Statut (Actif, Exclu, etc.)
 * Utilisable directement par Shadcn PieChart
 */
export class GetStatsByStatus extends AbstractEndpoint<any> {
  route = StatsRoutes.STUDENTS_BY_STATUS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: StatsFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TStatsFilter>): Promise<unknown> {
    return StatsService.getStudentStatusStats(params.schoolId, params.yearId);
  }
}

/**
 * Endpoint pour la répartition par Genre
 */
export class GetStatsByGender extends AbstractEndpoint<any> {
  route = StatsRoutes.STUDENTS_BY_GENDER;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: StatsFilterSchema.pick({ schoolId: true }), // Le genre peut être global à l'école
  };

  protected handle({
    params,
  }: IpcRequest<any, { schoolId: string }>): Promise<unknown> {
    return StatsService.getGenderDistribution(params.schoolId);
  }
}

/**
 * Endpoint pour la répartition par Classe (BarChart)
 */
export class GetStatsByClass extends AbstractEndpoint<any> {
  route = StatsRoutes.STUDENTS_BY_CLASS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: StatsFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TStatsFilter>): Promise<unknown> {
    return StatsService.getStudentsCountByClass(params.schoolId, params.yearId);
  }
}

/**
 * Endpoint pour la répartition par Option d'étude
 */
export class GetStatsByOption extends AbstractEndpoint<any> {
  route = StatsRoutes.STUDENTS_BY_OPTION;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: StatsFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TStatsFilter>): Promise<unknown> {
    return StatsService.getStudentsCountByOption(
      params.schoolId,
      params.yearId,
    );
  }
}

/**
 * Endpoint pour les métriques de rétention (Anciens vs Nouveaux)
 */
export class GetStatsRetention extends AbstractEndpoint<any> {
  route = StatsRoutes.RETENTION;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: StatsFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TStatsFilter>): Promise<unknown> {
    return StatsService.getRetentionMetrics(params.schoolId, params.yearId);
  }
}
