import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import { StatsRoutes } from "../routes-constant";
import { TStatsFilter } from "@/packages/@core/data-access/schema-validations";
import type {
  ChartDataPoint,
  ClassStatsDTO,
  EnrollmentStatsByYear,
  StatsSummary,
} from "@/packages/@core/data-access/db/queries";

/**
 * Interface représentant les KPIs rapides pour les cartes de résumé.
 */

/**
 * API Client pour la récupération des données analytiques.
 * Les types de retour sont optimisés pour les composants Chart de Shadcn.
 */
export type StatsApi = Readonly<{
  /** Récupère les compteurs clés (Total, Actifs, Exclus) */
  fetchSummary(params: TStatsFilter): Promise<StatsSummary>;

  /** Récupère la répartition par statut (Actif, Abandon, Exclu) */
  fetchByStatus(params: TStatsFilter): Promise<ChartDataPoint[]>;

  /** Récupère la répartition par genre (M/F) */
  fetchByGender(schoolId: string): Promise<ChartDataPoint[]>;

  /** Récupère le nombre d'élèves par classe */
  fetchByClass(params: TStatsFilter): Promise<ClassStatsDTO[]>;

  /** Récupère le nombre d'élèves par option d'étude */
  fetchByOption(params: TStatsFilter): Promise<ChartDataPoint[]>;

  /** Récupère les données de rétention (Anciens vs Nouveaux) */
  fetchRetention(params: TStatsFilter): Promise<ChartDataPoint[]>;

  /** Récupère le nombre total d'élèves (simple chiffre) */
  fetchTotalStudents(params: TStatsFilter): Promise<number>;

  /** Récupère les inscriptions par année avec répartition H/F */
  fetchEnrollmentsByYear(schoolId: string): Promise<EnrollmentStatsByYear[]>;
}>;

/**
 * Factory créant les méthodes API pour les statistiques.
 * Utilise l'IpcClient pour communiquer avec le Main Process.
 * @param ipcClient Le client IPC configuré.
 * @returns L'objet StatsApi en lecture seule.
 */
export function createStatsApis(ipcClient: IpcClient): StatsApi {
  return {
    fetchSummary(params) {
      return ipcClient.get(StatsRoutes.SUMMARY, { params });
    },

    fetchByStatus(params) {
      return ipcClient.get(StatsRoutes.STUDENTS_BY_STATUS, { params });
    },

    fetchByGender(schoolId) {
      return ipcClient.get(StatsRoutes.STUDENTS_BY_GENDER, {
        params: { schoolId },
      });
    },

    fetchByClass(params) {
      return ipcClient.get(StatsRoutes.STUDENTS_BY_CLASS, { params });
    },

    fetchByOption(params) {
      return ipcClient.get(StatsRoutes.STUDENTS_BY_OPTION, { params });
    },

    fetchRetention(params) {
      return ipcClient.get(StatsRoutes.RETENTION, { params });
    },

    fetchTotalStudents(params) {
      return ipcClient.get(StatsRoutes.TOTAL_STUDENTS, { params });
    },

    fetchEnrollmentsByYear(schoolId) {
      return ipcClient.get(StatsRoutes.ENROLLMENTS_BY_YEAR, {
        params: { schoolId },
      });
    },
  } as const;
}
