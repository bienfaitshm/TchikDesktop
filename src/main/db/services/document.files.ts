// src/services/document-processing/index.ts

import { DOCUMENT_TYPE } from "@/commons/libs/document";
import type {
  DocumentFilter,
  TSchool,
  ClassesWithStudents,
} from "@/commons/types/services";
import {
  type CotationData,
  generateEnrollementDocument,
  // Note: generateContationDocument n'est pas utilisé dans le code actuel mais est conservé
  generateContationDocument,
} from "@/main/libs/docx";
import { getClassesWithStudents } from "./document";
import { getSchool } from "./school";
import { mapModelsToPlainList, mapModelToPlain } from "../models/utils";
import {
  EXCEL_FILE_OPTIONS,
  TXT_FILE_OPTIONS,
  WORD_FILE_OPTIONS,
  SaveFileOptions,
} from "@/main/libs/save-files";

/**
 * @typedef {Object} DocumentGenerationResult
 * @property {any} data - Le contenu binaire ou l'objet du document généré.
 * @property {SaveFileOptions} options - Les options de sauvegarde du fichier (nom, extension, MIME type).
 */
export type DocumentGenerationResult = {
  data: any;
  options: SaveFileOptions;
};

/**
 * @typedef {Object} DocumentProcessParams
 * @property {TSchool} school - Les données de l'école (formatées en plain object).
 * @property {Omit<DocumentFilter, "documentType">} filter - Les critères de filtrage pour la récupération des données.
 */
type DocumentProcessParams = {
  school: TSchool;
  filter: Omit<DocumentFilter, "documentType">;
};

/**
 * @interface IDocumentProcessor
 * Définition de la fonction de traitement de document.
 * Chaque fonction doit prendre les paramètres de traitement et retourner une promesse
 * résolue avec le résultat de la génération du document.
 */
interface IDocumentProcessor {
  (params: DocumentProcessParams): Promise<DocumentGenerationResult>;
}

// --- Fonctions de Traitement Spécifiques ---

/**
 * @async
 * @function handleStudentList
 * Gère la génération du document de liste d'étudiants au format Word.
 * @param {DocumentProcessParams} params - Les paramètres incluant l'école et les filtres.
 * @returns {Promise<DocumentGenerationResult>}
 */
const handleStudentList: IDocumentProcessor = async ({ school, filter }) => {
  // 1. Récupération et formatage des données brutes (classes + étudiants)
  const classrooms = await parseClassroomWithStudent(filter);

  // 2. Génération du document Word
  const data = generateEnrollementDocument({ school, classrooms });

  // 3. Retour du contenu et des options de sauvegarde
  return { data, options: WORD_FILE_OPTIONS };
};

/**
 * @async
 * @function handleEnrollmentExcel
 * Gère la génération du fichier Excel d'inscription. (À implémenter)
 * @param {DocumentProcessParams} params - Les paramètres incluant l'école et les filtres.
 * @returns {Promise<DocumentGenerationResult>}
 */
const handleEnrollmentExcel: IDocumentProcessor = async () => {
  // TODO: Implémenter la logique pour le fichier Excel d'inscription
  return { data: null, options: EXCEL_FILE_OPTIONS };
};

/**
 * @async
 * @function handleEnrollmentStatistics
 * Gère la génération du rapport de statistiques d'inscription. (À implémenter)
 * @param {DocumentProcessParams} params - Les paramètres incluant l'école et les filtres.
 * @returns {Promise<DocumentGenerationResult>}
 */
const handleEnrollmentStatistics: IDocumentProcessor = async () => {
  // TODO: Implémenter la logique pour les statistiques d'inscription
  return { data: null, options: TXT_FILE_OPTIONS };
};

/**
 * @async
 * @function handleGradingSheet
 * Gère la génération de la feuille de cotation/note. (À implémenter)
 * @param {DocumentProcessParams} params - Les paramètres incluant l'école et les filtres.
 * @returns {Promise<DocumentGenerationResult>}
 */
const handleGradingSheet: IDocumentProcessor = async () => {
  // TODO: Implémenter la logique pour la feuille de cotation (possiblement avec generateContationDocument)
  // Exemple de structure de retour
  return { data: null, options: WORD_FILE_OPTIONS };
};

// --- Mappage des Types de Documents aux Processeurs ---

/**
 * @constant {Record<DOCUMENT_TYPE, IDocumentProcessor>} DocumentProcessors
 * Mappe chaque type de document à sa fonction de traitement dédiée.
 */
export const DocumentProcessors: Record<DOCUMENT_TYPE, IDocumentProcessor> = {
  [DOCUMENT_TYPE.STUDENT_LIST]: handleStudentList,
  [DOCUMENT_TYPE.ENROLLMENT_EXCEL]: handleEnrollmentExcel,
  [DOCUMENT_TYPE.ENROLLMENT_STATISTICS]: handleEnrollmentStatistics,
  [DOCUMENT_TYPE.GRADING_SHEET]: handleGradingSheet,
};

// --- Fonction d'Entrée Principale ---

/**
 * @async
 * @function processDocument
 * Fonction principale pour traiter et générer un document en fonction des filtres fournis.
 * @param {DocumentFilter} filter - Les critères de sélection du document (type, école, classes, année).
 * @returns {Promise<{success: true, result: DocumentGenerationResult} | {success: false, errorMessage: string}>}
 */
export async function processDocument(
  filter: DocumentFilter
): Promise<
  | { success: true; result: DocumentGenerationResult }
  | { success: false; errorMessage: string }
> {
  const { documentType, schoolId, sections, yearId, classrooms } = filter;

  // 1. Validation et récupération de l'école
  const schoolModel = await getSchool(schoolId);
  if (!schoolModel) {
    return {
      success: false,
      errorMessage: "L'école n'existe plus ou a été supprimée.",
    };
  }

  // 2. Conversion du modèle d'école en plain object pour la documentation
  const school = (await mapModelToPlain(schoolModel)) as TSchool;

  // 3. Recherche du processeur et exécution
  const processor = DocumentProcessors[documentType];

  if (!processor) {
    return {
      success: false,
      errorMessage: `Le type de document '${documentType}' n'a pas de processeur implémenté.`,
    };
  }

  try {
    const processParams: DocumentProcessParams = {
      school,
      filter: { schoolId, sections, yearId, classrooms },
    };

    const result = await processor(processParams);

    return { success: true, result };
  } catch (error) {
    // Gestion centralisée des erreurs de génération/traitement
    console.error(
      `Erreur lors du traitement du document ${documentType}:`,
      error
    );
    return {
      success: false,
      errorMessage:
        "Une erreur interne est survenue lors de la génération du document.",
    };
  }
}

/**
 * @async
 * @function parseClassroomWithStudent
 * Récupère les classes et leurs étudiants en fonction du filtre et les reformate
 * pour le système de documentation (CotationData format).
 * @param {Omit<DocumentFilter, "documentType">} filter - Les critères de filtrage.
 * @returns {Promise<CotationData["classrooms"]>} - Les données des classes formatées avec leurs étudiants.
 */
async function parseClassroomWithStudent(
  filter: Omit<DocumentFilter, "documentType">
): Promise<CotationData["classrooms"]> {
  // Récupération des données brutes des classes avec les enrôlements/étudiants
  const rawDataPromise = getClassesWithStudents(filter);

  // Conversion des modèles en objets simples (plain objects)
  const classroomsWithStudents = (await mapModelsToPlainList(
    rawDataPromise
  )) as unknown as ClassesWithStudents[];

  // Mappage pour structurer les données dans le format attendu par le générateur DOCX
  return classroomsWithStudents.map(({ ClassroomEnrolements, ...rest }) => ({
    ...rest,
    students: ClassroomEnrolements.map(({ User, ...enrollment }) => ({
      ...enrollment,
      ...User,
    })),
  }));
}
