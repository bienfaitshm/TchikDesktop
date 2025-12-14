/**
 * @file routes-constant.ts
 * @description Centralise toutes les définitions de routes IPC (Main ↔ Renderer)
 * en utilisant une structure RESTful standardisée.
 * Ces constantes sont utilisées par IpcClient et IpcServer pour la communication.
 */

interface RouteEndpoints {
  /** Route pour les requêtes qui ciblent une ALL (GET ALL, POST). Ex: 'resource' */
  ALL: string;
  /** Route pour les requêtes qui ciblent une ressource spécifique (GET ID, PUT/DELETE). Ex: 'resource/:id' */
  DETAIL: string;
  [key: string]: string;
}

// --- 2. Constantes de Routes par Ressource ---

/**
 * Routes IPC pour la gestion des OPTIONS.
 * Utilisées pour les choix et configurations simples.
 */
export const OptionRoutes: RouteEndpoints = {
  ALL: "options",
  // Supposant que l'ID est nécessaire pour cibler une option spécifique
  DETAIL: "options/:optionId",
};

/**
 * Routes IPC pour la gestion des SCHOOLS (Écoles).
 */
export const SchoolRoutes: RouteEndpoints = {
  ALL: "schools",
  // Utilise schoolId pour cibler une école spécifique
  DETAIL: "schools/:schoolId",
};

/**
 * Routes IPC pour la gestion des SCHOOLS (Écoles).
 */
export const StudyYearRoutes: RouteEndpoints = {
  ALL: "studyYear",
  // Utilise schoolId pour cibler une école spécifique
  DETAIL: "studyYear/:yearId",
};

/**
 * Routes IPC pour la gestion des CLASSROOMS (Salles de Classe).
 */
export const ClassroomRoutes: RouteEndpoints = {
  ALL: "classrooms",
  // Utilise classroomId pour cibler une salle spécifique
  DETAIL: "classrooms/:classroomId",
};

/**
 * Routes IPC pour la gestion de l'ENROLLEMENT (Inscription).
 * NOTE: L'inscription est souvent une ressource complexe, elle pourrait nécessiter
 * un ID composite ou un ID simple pour la gestion d'une seule inscription.
 */
export const EnrollementRoutes: RouteEndpoints = {
  ALL: "enrollements",
  // Utilise enrolmentId pour cibler un enregistrement d'inscription spécifique
  DETAIL: "enrollements/:enrollementId",
};

/**
 * Export global de toutes les routes pour une importation unique.
 */
export const IpcRoutes = {
  OPTIONS: OptionRoutes,
  SCHOOLS: SchoolRoutes,
  CLASSROOMS: ClassroomRoutes,
  ENROLLEMENTS: EnrollementRoutes,
  STUDY_YEAR: StudyYearRoutes,
} as const;
