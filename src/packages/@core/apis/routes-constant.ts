/**
 * @file routes-constant.ts
 * @description Centralise toutes les définitions de routes IPC (Main ↔ Renderer)
 * en utilisant une structure RESTful standardisée.
 * Ces constantes sont utilisées par IpcClient et IpcServer pour la communication.
 */

// --- 2. Constantes de Routes par Ressource ---

/**
 * Routes IPC pour la gestion des OPTIONS.
 * Utilisées pour les choix et configurations simples.
 */
export const OptionRoutes = {
  ALL: "options",
  // Supposant que l'ID est nécessaire pour cibler une option spécifique
  DETAIL: "options/:optionId",
} as const;

/**
 * Routes IPC pour la gestion des SCHOOLS (Écoles).
 */
export const SchoolRoutes = {
  ALL: "schools",
  // Utilise schoolId pour cibler une école spécifique
  DETAIL: "schools/:schoolId",
} as const;

/**
 * Routes IPC pour la gestion des SCHOOLS (Écoles).
 */
export const StudyYearRoutes = {
  ALL: "studyYear",
  // Utilise schoolId pour cibler une école spécifique
  DETAIL: "studyYear/:yearId",
} as const;

/**
 * Routes IPC pour la gestion des CLASSROOMS (Salles de Classe).
 */
export const ClassroomRoutes = {
  ALL: "classrooms",
  // Utilise classroomId pour cibler une salle spécifique
  DETAIL: "classrooms/:classroomId",
} as const;

/**
 * Routes IPC pour la gestion de l'ENROLLEMENT (Inscription).
 * NOTE: L'inscription est souvent une ressource complexe, elle pourrait nécessiter
 * un ID composite ou un ID simple pour la gestion d'une seule inscription.
 */
export const EnrollementRoutes = {
  ALL: "enrollements",
  // Utilise enrolmentId pour cibler un enregistrement d'inscription spécifique
  DETAIL: "enrollements/:enrollementId",
  ALL_HISTORIES: "enrollements/histories",
  QUICK_ENROLLEMENT: "enrollements/quick",
} as const;

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
