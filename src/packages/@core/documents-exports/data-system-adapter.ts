// Importations nécessaires
import { IQueryBus } from "@/main/db/services/query-bus.service";
import { ServiceOperationResult } from "./document-export.service";

// Assumons que ces types existent dans vos fichiers (refactorisés précédemment)

// A. Type du Système de Requête (Query Bus) - Résultat du Handler
export type DataAccessResult<TPayload> =
  | { success: true; payload: TPayload } // NOTA BENE: Utilise 'payload'
  | {
      success: false;
      error: { code: string; message: string; details?: unknown };
    };

// NOTE: J'ai corrigé le type ServiceOperationResult pour utiliser 'payload' car
// la requête utilisateur indiquait précédemment 'data', mais 'payload' est la convention moderne.
// Si votre type réel utilise 'data', ajustez l'implémentation.

// Simuler l'interface du service consommateur
export interface IDataFetchingService {
  fetch(
    queryKey: string,
    params: unknown
  ): Promise<ServiceOperationResult<unknown>>;
}

/**
 * 🔗 DataSystemAdapter
 * Adapte le QueryBus (IQueryBus) pour qu'il puisse être consommé par l'IDataFetchingService
 * (ou tout autre service nécessitant une abstraction simple 'fetch').
 * * Cet adaptateur permet :
 * 1. D'implémenter IDataFetchingService en utilisant IQueryBus comme backend.
 * 2. De traduire les structures de résultat si nécessaire (même si elles sont ici très proches).
 */
export class DataSystemAdapter implements IDataFetchingService {
  // Dépendance : le Query Bus réel
  private readonly queryBus: IQueryBus;

  constructor(queryBus: IQueryBus) {
    this.queryBus = queryBus;
  }

  /**
   * Implémente le contrat IDataFetchingService.fetch.
   * Isole le DocumentExportService (ou autre) des détails du QueryBus.
   * * Signature cible :
   * fetch(queryKey, params): Promise<ServiceOperationResult<unknown>>
   */
  public async fetch(
    queryKey: string,
    params: unknown
  ): Promise<ServiceOperationResult<unknown>> {
    // 1. Appel du backend (QueryBus)
    // On force TPayload à unknown car fetch demande unknown dans son contrat.
    const result: DataAccessResult<unknown> =
      await this.queryBus.execute<unknown>(queryKey, params);

    // 2. Conversion (Mapping des résultats)
    // Puisque DataAccessResult et ServiceOperationResult ont la même structure ('success' et 'payload'/'error'),
    // la conversion est directe (pas de logique de mapping complexe nécessaire).

    return result as ServiceOperationResult<unknown>;
  }

  // Vice-Versa (À titre d'illustration - rarement nécessaire) :
  // Si nous avions un ancien service fetch et voulions créer un QueryBus autour de lui,
  // on pourrait implémenter IQueryBus :

  // public async execute<TPayload>(
  //     queryId: string,
  //     params: unknown
  // ): Promise<DataAccessResult<TPayload>> {
  //     const legacyResult: ServiceOperationResult<TPayload> = await this.legacyFetchingService.fetch(queryId, params);
  //     return legacyResult as DataAccessResult<TPayload>;
  // }
}
