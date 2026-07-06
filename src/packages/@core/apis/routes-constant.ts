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
export const EnrollmentRoutes = {
  ALL: "enrollments",
  SEARCH: "enrollments/search",
  DETAIL: "enrollments/:enrollmentId",
  ALL_HISTORIES: "enrollments/histories",
  QUICK_ENROLLMENT: "enrollments/quick",
} as const;

export const DocumentExportRoutes = {
  INFOS: "documents/infos",
  EXPORTS: "documents/exports",
} as const; // <-- Strict typage ajouté

/**
 * Routes IPC pour les STATISTIQUES et ANALYTICS.
 * Permet de récupérer les données agrégées pour les graphiques et KPI.
 */
export const StatsRoutes = {
  SUMMARY: "stats/summary",

  STUDENTS_BY_STATUS: "stats/students/status",
  STUDENTS_BY_GENDER: "stats/students/gender",
  STUDENTS_BY_CLASS: "stats/students/class",
  STUDENTS_BY_OPTION: "stats/students/option",
  TOTAL_STUDENTS: "stats/students/total",

  RETENTION: "stats/retention",
  ENROLLMENTS_BY_YEAR: "stats/enrollments/by-year",
} as const;

export const AppInfosRoutes = {
  SYS_INFOS: "app-infos/sys-infos",
} as const; // <-- Strict typage ajouté

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
  STATUS: "seating/sessions/:id/status",
  FULL_DETAILS: "seating/sessions/:id/full",
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

/* =========================================================================
   FINANCE MODULE ROUTES
   ========================================================================= */

/**
 * Routes IPC pour la gestion des PORTEFEUILLES.
 */
export const WalletRoutes = {
  ALL: "wallets",
  SEARCH: "wallets/search",
  DETAIL: "wallets/:walletId",
} as const;

/**
 * Routes IPC pour la gestion des TYPES DE FRAIS.
 */
export const FeeTypeRoutes = {
  ALL: "fee-types",
  SEARCH: "fee-types/search",
  DETAIL: "fee-types/:feeTypeId",
} as const;

/**
 * Routes IPC pour la gestion des ÉCHÉANCIERS
 */
export const FeeScheduleRoutes = {
  ALL: "fee-schedules",
  SEARCH: "fee-schedules/search",
  DETAIL: "fee-schedules/:scheduleId",
  BY_FEE_TYPE: "fee-schedules/fee-type/:feeTypeId",
} as const;

/**
 * Routes IPC pour la gestion des CONFIGURATIONS DE FRAIS.
 */
export const FeeConfigurationRoutes = {
  ALL: "fee-configurations",
  SEARCH: "fee-configurations/search",
  DETAIL: "fee-configurations/:feeConfigId",
} as const;

/**
 * Routes IPC pour la gestion des ATTRIBUTIONS (échéanciers élèves).
 */
export const FeeAssignmentRoutes = {
  ALL: "fee-assignments",
  SEARCH: "fee-assignments/search",
  DETAIL: "fee-assignments/:assignmentId",
} as const;

/**
 * Routes IPC pour la gestion des PAIEMENTS ÉLÈVES.
 */
export const StudentPaymentRoutes = {
  ALL: "student-payments",
  SEARCH: "student-payments/search",
  DETAIL: "student-payments/:paymentId",
} as const;

/**
 * Routes IPC pour la gestion des TAUX DE CHANGE QUOTIDIENS.
 */
export const DailyExchangeRateRoutes = {
  ALL: "daily-exchange-rates",
  SEARCH: "daily-exchange-rates/search",
  DETAIL: "daily-exchange-rates/:rateId",
} as const;

/**
 * Export global mis à jour avec les nouveaux modules
 */
export const IpcRoutes = {
  OPTIONS: OptionRoutes,
  SCHOOLS: SchoolRoutes,
  CLASSROOMS: ClassroomRoutes,
  ENROLLEMENTS: EnrollmentRoutes,
  STUDY_YEAR: StudyYearRoutes,
  DOCUMENT_EXPORT: DocumentExportRoutes,
  STATS: StatsRoutes,
  APP_INFOS: AppInfosRoutes,
  USERS: UserRoutes,
  LOCAL_ROOMS: LocalRoomRoutes,
  SEATING_SESSIONS: SeatingSessionRoutes,
  SEATING_ASSIGNMENTS: SeatingAssignmentRoutes,
  WALLETS: WalletRoutes,
  FEE_TYPES: FeeTypeRoutes,
  FEE_SCHEDULES: FeeScheduleRoutes, // <-- AJOUTÉ AU REGISTRE CENTRAL
  FEE_CONFIGURATIONS: FeeConfigurationRoutes,
  FEE_ASSIGNMENTS: FeeAssignmentRoutes,
  STUDENT_PAYMENTS: StudentPaymentRoutes,
  DAILY_EXCHANGE_RATES: DailyExchangeRateRoutes,
} as const;
