/**
 * @file routes-constant.ts
 * @description Centralise toutes les définitions de routes IPC (Main ↔ Renderer)
 * en utilisant une structure RESTful standardisée.
 * Ces constantes sont utilisées par IpcClient et IpcServer pour la communication.
 */

export const UserRoutes = {
  ALL: "users",
  DETAIL: "users/:userId",
  SEARCH: "users/search",
} as const;

/**
 * Routes IPC pour la gestion des OPTIONS.
 * Utilisées pour les choix et configurations simples.
 */
export const OptionRoutes = {
  ALL: "options",
  SEARCH: "options/search",
  DETAIL: "options/:optionId",
} as const;

/**
 * Routes IPC pour la gestion des SCHOOLS (Écoles).
 */
export const SchoolRoutes = {
  ALL: "schools",
  SEARCH: "schools/search",
  DETAIL: "schools/:schoolId",
} as const;

/**
 * Routes IPC pour la gestion des SCHOOLS (Écoles).
 */
export const StudyYearRoutes = {
  ALL: "studyYear",
  SEARCH: "studyYear/search",
  DETAIL: "studyYear/:yearId",
} as const;

/**
 * Routes IPC pour la gestion des CLASSROOMS (Salles de Classe).
 */
export const ClassroomRoutes = {
  ALL: "classrooms",
  SEARCH: "classrooms/search",
  ALL_ENROLLMENT: "classrooms/enrollments",
  DETAIL: "classrooms/:classroomId",
} as const;

/**
 * Routes IPC pour la gestion de l'ENROLLEMENT (Inscription).
 * NOTE: L'inscription est souvent une ressource complexe, elle pourrait nécessiter
 * un ID composite ou un ID simple pour la gestion d'une seule inscription.
 */
export const EnrollementRoutes = {
  ALL: "enrollments",
  SEARCH: "enrollments/search",
  DETAIL: "enrollments/:enrollmentId",
  ALL_HISTORIES: "enrollments/histories",
  QUICK_ENROLLEMENT: "enrollments/quick",
} as const;

export const DocumentExportRoutes = {
  INFOS: "documents/infos",
  EXPORTS: "documents/exports",
};

/**
 * Routes IPC pour les STATISTIQUES et ANALYTICS.
 * Permet de récupérer les données agrégées pour les graphiques et KPI.
 */
export const StatsRoutes = {
  // Global & KPI (Total étudiants, ratio, etc.)
  SUMMARY: "stats/summary",

  STUDENTS_BY_STATUS: "stats/students/status",
  STUDENTS_BY_GENDER: "stats/students/gender",
  STUDENTS_BY_CLASS: "stats/students/class",
  STUDENTS_BY_OPTION: "stats/students/option",

  RETENTION: "stats/retention",
} as const;

export const AppInfosRoutes = {
  SYS_INFOS: "app-infos/sys-infos",
};

/**
 * Routes IPC pour la gestion des LOCAUX (Salles physiques).
 */
export const LocalRoomRoutes = {
  ALL: "seating/rooms",
  SEARCH: "seating/rooms/search",
  DETAIL: "seating/rooms/:id",
  CREATE: "seating/rooms/create",
} as const;

/**
 * Routes IPC pour la gestion des SESSIONS de placement.
 */
export const SeatingSessionRoutes = {
  ALL: "seating/sessions",
  SEARCH: "seating/sessions/search",
  BY_YEAR: "seating/sessions/year/:yearId",
  DETAIL: "seating/sessions/:id",
  STATUS: "seating/sessions/:id/status", // Pour GetSessionRoomsStatus
  FULL_DETAILS: "seating/sessions/:id/full", // Pour GetFullSessionDetails
  CREATE: "seating/sessions/create",
} as const;

/**
 * Routes IPC pour les ASSIGNATIONS (Le placement réel).
 */
export const SeatingAssignmentRoutes = {
  GENERATING: "seating/generating",
  LAYOUT: "seating/assignments/layout/:sessionId/:localRoomId",
  BULK: "seating/assignments/bulk",
  RE_ASSIGNED: "seating/assignments/assignment",
  UNASSIGNED: "seating/assignments/unassigned/:sessionId/:yearId",
  FIND_STUDENT: "seating/assignments/find/:sessionId/:enrolementId",
  CLEAR_ROOM: "seating/assignments/clear",
} as const;

/**
 * Export global mis à jour avec les nouveaux modules
 */
export const IpcRoutes = {
  OPTIONS: OptionRoutes,
  SCHOOLS: SchoolRoutes,
  CLASSROOMS: ClassroomRoutes,
  ENROLLEMENTS: EnrollementRoutes,
  STUDY_YEAR: StudyYearRoutes,
  DOCUMENT_EXPORT: DocumentExportRoutes,
  STATS: StatsRoutes,
  APP_INFOS: AppInfosRoutes,
  USERS: UserRoutes,
  // --- Nouveaux modules Seating ---
  LOCAL_ROOMS: LocalRoomRoutes,
  SEATING_SESSIONS: SeatingSessionRoutes,
  SEATING_ASSIGNMENTS: SeatingAssignmentRoutes,
} as const;
