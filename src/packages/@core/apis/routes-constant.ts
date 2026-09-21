/**
 * @file routes-constant.ts
 * @description Centralizes all IPC route channel definitions between Main and Renderer processes
 * using a standardized RESTful URI format.
 */

/**
 * IPC routes for global search operations.
 */
export const SearchRoutes = {
  homeSearch: "search",
  detailSearch: "search/results",
} as const;

/**
 * IPC routes for user profile management.
 */
export const UserRoutes = {
  ALL: "users",
  DETAIL: "users/:userId",
  SEARCH: "users/search",
  BULK: "users/bulk",
} as const;

/**
 * IPC routes for student tutor operations.
 */
export const TutorRoutes = {
  ALL: "tutors",
  DETAIL: "tutors/:tutorId",
  SEARCH: "tutors/search",
  BULK: "tutors/bulk",
  QUICK: "tutors/quick",
} as const;

/**
 * IPC routes for option configurations.
 */
export const OptionRoutes = {
  ALL: "options",
  SEARCH: "options/search",
  DETAIL: "options/:optionId",
  BULK: "options/bulk",
} as const;

/**
 * IPC routes for school entity operations.
 */
export const SchoolRoutes = {
  ALL: "schools",
  SEARCH: "schools/search",
  DETAIL: "schools/:schoolId",
  BULK: "schools/bulk",
} as const;

/**
 * IPC routes for academic study year records.
 */
export const StudyYearRoutes = {
  ALL: "studyYear",
  SEARCH: "studyYear/search",
  DETAIL: "studyYear/:yearId",
  BULK: "studyYear/bulk",
} as const;

/**
 * IPC routes for classroom entity operations.
 */
export const ClassroomRoutes = {
  ALL: "classrooms",
  SEARCH: "classrooms/search",
  ALL_ENROLLMENT: "classrooms/enrollments",
  DETAIL: "classrooms/:classroomId",
  BULK: "classrooms/bulk",
} as const;

/**
 * IPC routes for student enrollment lifecycles.
 */
export const EnrollmentRoutes = {
  ALL: "enrollments",
  SEARCH: "enrollments/search",
  DETAIL: "enrollments/:enrollmentId",
  MARK_AS_PRODEO: "enrollments/mark-as-prodeo",
  ALL_HISTORIES: "enrollments/histories",
  QUICK_ENROLLMENT: "enrollments/quick",
  BULK: "enrollments/bulk",
} as const;

/**
 * IPC routes for document export operations.
 */
export const DocumentExportRoutes = {
  INFOS: "documents/infos",
  EXPORTS: "documents/exports",
} as const;

/**
 * IPC routes for system statistics and analytics.
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

/**
 * IPC routes for system information readout.
 */
export const AppInfosRoutes = {
  SYS_INFOS: "app-infos/sys-infos",
} as const;

/**
 * IPC routes for exam room physical location management.
 */
export const LocalRoomRoutes = {
  ALL: "seating/rooms",
  SEARCH: "seating/rooms/search",
  DETAIL: "seating/rooms/:id",
  CREATE: "seating/rooms/create",
  BULK: "seating/rooms/bulk",
} as const;

/**
 * IPC routes for exam seating session setup.
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
 * IPC routes for dynamic student seating assignments.
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
 * IPC routes for high-level payment views and workflow processing.
 */
export const PaymentRoutes = {
  CLASSROOM_TABLE: "payments/classroom-table",
  STUDENT_PAYMENT_OVERVIEW: "payments/student/overview",
  ASSIGN_FEES: "payments/assign-fees",
  PROCESS_PAYMENT: "payments/process",
  PRINT_TICKET: "payments/ticket/print",
} as const;

/**
 * IPC routes for financial wallet management.
 */
export const WalletRoutes = {
  ALL: "wallets",
  SEARCH: "wallets/search",
  DETAIL: "wallets/:walletId",
  BULK: "wallets/bulk",
} as const;

/**
 * IPC routes for fee types catalog.
 */
export const FeeTypeRoutes = {
  ALL: "fee-types",
  SEARCH: "fee-types/search",
  DETAIL: "fee-types/:feeTypeId",
  BULK: "fee-types/bulk",
} as const;

/**
 * IPC routes for fee schedule configurations.
 */
export const FeeScheduleRoutes = {
  ALL: "fee-schedules",
  SEARCH: "fee-schedules/search",
  DETAIL: "fee-schedules/:scheduleId",
  BY_FEE_TYPE: "fee-schedules/fee-type/:feeTypeId",
  BULK: "fee-schedules/bulk",
} as const;

/**
 * IPC routes for applicable fee configurations.
 */
export const FeeConfigurationRoutes = {
  ALL: "fee-configurations",
  SEARCH: "fee-configurations/search",
  DETAIL: "fee-configurations/:feeConfigId",
  BULK: "fee-configurations/bulk",
  APPLICABLE: "fee-configurations/applicable",
  APPLICABLE_CLASSROOM: "fee-configurations/applicable/CLASSROOM",
} as const;

/**
 * IPC routes for individual student fee assignment records.
 */
export const FeeAssignmentRoutes = {
  ALL: "fee-assignments",
  UPDATE_TOTAL_AMOUNT_ASSIGNMENT:
    "fee-assignments/update-total-amount/assignments",
  UPDATE_TOTAL_AMOUNT_CLASSROOM:
    "fee-assignments/update-total-amount/classrooms",
  EXEMPT_FROM_FEE: "fee-assignments/exempt-from-fee",
  BULK: "fee-assignments/bulk",
  SEARCH: "fee-assignments/search",
  DETAIL: "fee-assignments/:assignmentId",
} as const;

/**
 * IPC routes for individual student payments ledger.
 */
export const StudentPaymentRoutes = {
  ALL: "student-payments",
  SEARCH: "student-payments/search",
  DETAIL: "student-payments/:paymentId",
  BULK: "student-payments/bulk",
} as const;

/**
 * IPC routes for currency exchange rates.
 */
export const DailyExchangeRateRoutes = {
  ALL: "daily-exchange-rates",
  SEARCH: "daily-exchange-rates/search",
  DETAIL: "daily-exchange-rates/:rateId",
  BULK: "daily-exchange-rates/bulk",
  LTS: "daily-exchange-rates/lts",
} as const;

/**
 * IPC routes for system dashboard views.
 */
export const DashboardRoutes = {
  FIN_DASHBOARD: "dashboard/fin",
  SCHOOL_DASHBOARD: "dashboard/school",
} as const;

/**
 * IPC routes for thermal hardware printer integration.
 */
export const PrinterRoutes = {
  GET_PRINTERS: "prints/get-printers",
  PRINT_TEST: "prints/test-printer",
  PRINT_RECEIPT: "prints/receipt/payment",
  CHECK_PRINTER: "prints/check-printer",
} as const;

/**
 * Global IPC route map aggregating all application feature routes.
 */
export const IpcRoutes = {
  SEARCH: SearchRoutes,
  OPTIONS: OptionRoutes,
  SCHOOLS: SchoolRoutes,
  CLASSROOMS: ClassroomRoutes,
  ENROLLMENTS: EnrollmentRoutes,
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
  PRINT: PrinterRoutes,
} as const;

/**
 * Type utility representing the entirety of valid IPC route mappings.
 */
export type IpcRoutesType = typeof IpcRoutes;
