/**
 * @file routes-constant.ts
 * @description Centralise toutes les définitions de routes IPC (Main - Renderer)
 * en utilisant une structure RESTful standardisée.
 * Ces constantes sont utilisées par IpcClient et IpcServer pour la communication.
 */

export const UserRoutes = {
  ALL: "users",
  DETAIL: "users/:userId",
  SEARCH: "users/search",
  BULK: "users/bulk",
} as const;

export const TutorRoutes = {
  ALL: "tutors",
  DETAIL: "tutors/:tutorId",
  SEARCH: "tutors/search",
  BULK: "tutors/bulk",
} as const;

/**
 * Routes IPC pour la gestion des OPTIONS.
 * Utilisées pour les choix et configurations simples.
 */
export const OptionRoutes = {
  ALL: "options",
  SEARCH: "options/search",
  DETAIL: "options/:optionId",
  BULK: "options/bulk",
} as const;

/**
 * Routes IPC pour la gestion des SCHOOLS (Écoles).
 */
export const SchoolRoutes = {
  ALL: "schools",
  SEARCH: "schools/search",
  DETAIL: "schools/:schoolId",
  BULK: "schools/bulk",
} as const;

/**
 * Routes IPC pour la gestion des STUDY YEARS (Années scolaires).
 */
export const StudyYearRoutes = {
  ALL: "studyYear",
  SEARCH: "studyYear/search",
  DETAIL: "studyYear/:yearId",
  BULK: "studyYear/bulk",
} as const;

/**
 * Routes IPC pour la gestion des CLASSROOMS (Salles de Classe).
 */
export const ClassroomRoutes = {
  ALL: "classrooms",
  SEARCH: "classrooms/search",
  ALL_ENROLLMENT: "classrooms/enrollments",
  DETAIL: "classrooms/:classroomId",
  BULK: "classrooms/bulk",
} as const;

/**
 * Routes IPC pour la gestion de l'ENROLLEMENT (Inscription).
 */
export const EnrollmentRoutes = {
  ALL: "enrollments",
  SEARCH: "enrollments/search",
  DETAIL: "enrollments/:enrollmentId",
  ALL_HISTORIES: "enrollments/histories",
  QUICK_ENROLLMENT: "enrollments/quick",
  BULK: "enrollments/bulk",
} as const;

export const DocumentExportRoutes = {
  INFOS: "documents/infos",
  EXPORTS: "documents/exports",
} as const;

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
} as const;

/**
 * Routes IPC pour la gestion des LOCAUX (Salles physiques).
 */
export const LocalRoomRoutes = {
  ALL: "seating/rooms",
  SEARCH: "seating/rooms/search",
  DETAIL: "seating/rooms/:id",
  CREATE: "seating/rooms/create",
  BULK: "seating/rooms/bulk",
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
  BULK: "seating/sessions/bulk",
} as const;

/**
 * Routes IPC pour les ASSIGNATIONS (Le placement réel).
 * (BULK déjà présent)
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

export const PaymentRoutes = {
  /**
   * Récupérer le tableau matriciel des assignations et statuts de paiement d'une classe.
   * Utile pour la vue globale de type grille/table côté Front.
   */
  CLASSROOM_TABLE: "payments/classroom-table",
  STUDENT_PAYMENT_OVERVIEW: "payments/student/overview",

  /**
   * Route POST pour l'assignation automatique ou manuelle de frais initiaux à un étudiant.
   */
  ASSIGN_FEES: "payments/assign-fees",

  /**
   * Route POST centrale pour traiter un encaissement au guichet (Ledger + Wallet sync).
   */
  PROCESS_PAYMENT: "payments/process",
  PRINT_TICKET: "payments/ticket/print",
} as const;

/**
 * Routes IPC pour la gestion des PORTEFEUILLES.
 */
export const WalletRoutes = {
  ALL: "wallets",
  SEARCH: "wallets/search",
  DETAIL: "wallets/:walletId",
  BULK: "wallets/bulk",
} as const;

/**
 * Routes IPC pour la gestion des TYPES DE FRAIS.
 */
export const FeeTypeRoutes = {
  ALL: "fee-types",
  SEARCH: "fee-types/search",
  DETAIL: "fee-types/:feeTypeId",
  BULK: "fee-types/bulk",
} as const;

/**
 * Routes IPC pour la gestion des ÉCHÉANCIERS
 */
export const FeeScheduleRoutes = {
  ALL: "fee-schedules",
  SEARCH: "fee-schedules/search",
  DETAIL: "fee-schedules/:scheduleId",
  BY_FEE_TYPE: "fee-schedules/fee-type/:feeTypeId",
  BULK: "fee-schedules/bulk",
} as const;

/**
 * Routes IPC pour la gestion des CONFIGURATIONS DE FRAIS.
 */
export const FeeConfigurationRoutes = {
  ALL: "fee-configurations",
  SEARCH: "fee-configurations/search",
  DETAIL: "fee-configurations/:feeConfigId",
  BULK: "fee-configurations/bulk",
  APPLICABLE: "fee-configurations/applicable",
} as const;

/**
 * Routes IPC pour la gestion des ATTRIBUTIONS (échéanciers élèves).
 * (BULK déjà présent)
 */
export const FeeAssignmentRoutes = {
  ALL: "fee-assignments",
  BULK: "fee-assignments/bulk",
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
  BULK: "student-payments/bulk",
} as const;

/**
 * Routes IPC pour la gestion des TAUX DE CHANGE QUOTIDIENS.
 */
export const DailyExchangeRateRoutes = {
  ALL: "daily-exchange-rates",
  SEARCH: "daily-exchange-rates/search",
  DETAIL: "daily-exchange-rates/:rateId",
  BULK: "daily-exchange-rates/bulk",
  LTS: "daily-exchange-rates/lts",
} as const;

export const DashboardRoutes = {
  FIN_DASHBOARD: "dashboard/fin",
  SCHOOL_DASHBOARD: "dashboard/school",
};

export const PrinteToutes = {
  GET_PRINTERS: "prints/get-printers",
  PRINT_TEST: "prints/test-printer",
  PRINT_RECEIPT: "prints/receipt/payment",
  CHECK_PRINTER: "prints/check-printer",
};

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
  TUTORS: TutorRoutes,
  LOCAL_ROOMS: LocalRoomRoutes,
  SEATING_SESSIONS: SeatingSessionRoutes,
  SEATING_ASSIGNMENTS: SeatingAssignmentRoutes,
  WALLETS: WalletRoutes,
  FEE_TYPES: FeeTypeRoutes,
  FEE_SCHEDULES: FeeScheduleRoutes,
  FEE_CONFIGURATIONS: FeeConfigurationRoutes,
  FEE_ASSIGNMENTS: FeeAssignmentRoutes,
  STUDENT_PAYMENTS: StudentPaymentRoutes,
  DAILY_EXCHANGE_RATES: DailyExchangeRateRoutes,
  PAYMENT: PaymentRoutes,
  DASHBOARD: DashboardRoutes,
  PRINT: PrinteToutes,
} as const;
