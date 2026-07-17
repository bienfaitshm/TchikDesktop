export const ROUTES = {
  HOME: "/",
  ENROLLMENTS: "/enrollments",
  PAYMENTS: "payments",
  SCHOOLS: {
    ROOT: "/schools",
    OPTIONS: "options",
    LOCALS: "locals",
    STUDY_YEARS: "school-years",
    LIST: "schools",
    TUTORS: "tutors",
    TEACHERS: "teachers",
  },
  SEATING: {
    ROOT: "/seating",
    SESSION: ":sessionId",
    SESSION_ASSIGNMENT: ":localroomId",
  },

  CLASSROOMS: {
    ROOT: "/classrooms",
    CLASSROOM: ":classroomId",
    STUDENTS: "students",
  },

  SETTINGS: {
    ROOT: "/settings",
    HELP: "help",
    DEVELOPER: "developer",
    ACCOUNT: "account",
    ABOUT: "about",
    NOTIFICATIONS: "notifications",
  },

  CONFIG: {
    ROOT: "/configuration",
    SCHOOL_NEW: "school/new",
    STUDY_YEAR: "school-year",
    STUDY_YEAR_NEW: "school-year/new",
  },

  PARAMS: {
    WALLET_ID: ":walletId",
    FEE_TYPE_ID: ":feeTypeId",
    FEE_CONFIG_ID: ":feeConfigId",
    CLASSROOM_ID: ":classroomId",
    ASSIGNMENT_ID: ":assignmentId",
    PAYMENT_ID: ":paymentId",
    RATE_ID: ":rateId",
  },
  ACTIONS: {
    NEW: "new",
    EDIT: "edit",
    ASSIGNMENTS: "assignments",
    PAYMENTS: "payments",
  },

  FIN: {
    ROOT: "/fin",
    DASHBOARD: "dashboard",
    WALLET: "wallets",
    PAYMENT_CONFIG: "config",
    FEE_TYPE: "fee-types",
    CLASSROOMS: "classrooms",
    PAYMENTS: "payments",
    PAYMENTS_HISTORIES: "histories",
    EXCHANGE_RATES: "exchange-rates",
  },
} as const;

export const APP_ROUTES = {
  HOME: ROUTES.HOME,
  ENROLLMENTS: ROUTES.ENROLLMENTS,
  PAYEMENTS: ROUTES.PAYMENTS,
  SCHOOLS: {
    LIST: `${ROUTES.SCHOOLS.ROOT}/${ROUTES.SCHOOLS.LIST}`,
    ROOT: ROUTES.SCHOOLS.ROOT,
    OPTIONS: `${ROUTES.SCHOOLS.ROOT}/${ROUTES.SCHOOLS.OPTIONS}`,
    LOCALS: `${ROUTES.SCHOOLS.ROOT}/${ROUTES.SCHOOLS.LOCALS}`,
    SCHOOL_YEARS: `${ROUTES.SCHOOLS.ROOT}/${ROUTES.SCHOOLS.STUDY_YEARS}`,
    TUTORS: `${ROUTES.SCHOOLS.ROOT}/${ROUTES.SCHOOLS.TUTORS}`,
  },

  SEATING: {
    ROOT: ROUTES.SEATING.ROOT,
    SESSION: (sessionId: string | number) =>
      `${ROUTES.SEATING.ROOT}/${sessionId}`,
    ASSIGNMENT: (sessionId: string | number, localroomId: string | number) =>
      `${ROUTES.SEATING.ROOT}/${sessionId}/${localroomId}`,
  },

  CLASSROOMS: {
    ROOT: ROUTES.CLASSROOMS.ROOT,
    DETAIL: (classroomId: string | number) =>
      `${ROUTES.CLASSROOMS.ROOT}/${classroomId}`,
    STUDENTS: (classroomId: string | number) =>
      `${ROUTES.CLASSROOMS.ROOT}/${classroomId}/${ROUTES.CLASSROOMS.STUDENTS}`,
  },

  SETTINGS: {
    ROOT: ROUTES.SETTINGS.ROOT,
    HELP: `${ROUTES.SETTINGS.ROOT}/${ROUTES.SETTINGS.HELP}`,
    DEVELOPER: `${ROUTES.SETTINGS.ROOT}/${ROUTES.SETTINGS.DEVELOPER}`,
    ACCOUNT: `${ROUTES.SETTINGS.ROOT}/${ROUTES.SETTINGS.ACCOUNT}`,
    ABOUT: `${ROUTES.SETTINGS.ROOT}/${ROUTES.SETTINGS.ABOUT}`,
    NOTIFICATIONS: `${ROUTES.SETTINGS.ROOT}/${ROUTES.SETTINGS.NOTIFICATIONS}`,
  },

  CONFIGURATION: {
    ROOT: ROUTES.CONFIG.ROOT,
    SCHOOL_NEW: `${ROUTES.CONFIG.ROOT}/${ROUTES.CONFIG.SCHOOL_NEW}`,
    SCHOOL_YEAR: `${ROUTES.CONFIG.ROOT}/${ROUTES.CONFIG.STUDY_YEAR}`,
    SCHOOL_YEAR_NEW: `${ROUTES.CONFIG.ROOT}/${ROUTES.CONFIG.STUDY_YEAR_NEW}`,
  },

  // ---- Uniformisé ----
  FIN: {
    DASHBOARD: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.DASHBOARD}`,

    // --- Portefeuilles (wallets) ---
    WALLETS: {
      LIST: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.WALLET}`,
      DETAIL: (walletId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.WALLET}/${walletId}`,
      NEW: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.WALLET}/new`,
      EDIT: (walletId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.WALLET}/${walletId}/edit`,
    },

    // --- Types de frais ---
    FEE_TYPES: {
      LIST: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.FEE_TYPE}`,
      DETAIL: (feeTypeId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.FEE_TYPE}/${feeTypeId}`,
      NEW: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.FEE_TYPE}/new`,
      EDIT: (feeTypeId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.FEE_TYPE}/${feeTypeId}/edit`,
    },

    // --- Configurations de frais ---
    PAYMENT_CONFIGS: {
      LIST: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.PAYMENT_CONFIG}`,
      DETAIL: (feeConfigId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.PAYMENT_CONFIG}/${feeConfigId}`,
      NEW: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.PAYMENT_CONFIG}/new`,
      EDIT: (feeConfigId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.PAYMENT_CONFIG}/${feeConfigId}/edit`,
    },

    // --- Gestion par classe (affectations + paiements) ---
    CLASSROOMS: {
      LIST: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.CLASSROOMS}`,
      DETAIL: (classroomId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.CLASSROOMS}/${classroomId}`,

      ASSIGNMENTS: (classroomId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.CLASSROOMS}/${classroomId}/assignments`,
      ASSIGNMENT_NEW: (classroomId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.CLASSROOMS}/${classroomId}/assignments/new`,
      ASSIGNMENT_EDIT: (
        classroomId: string | number,
        assignmentId: string | number,
      ) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.CLASSROOMS}/${classroomId}/assignments/${assignmentId}/edit`,

      PAYMENTS: (classroomId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.CLASSROOMS}/${classroomId}/payments`,
      PAYMENT_DETAIL: (
        classroomId: string | number,
        paymentId: string | number,
      ) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.CLASSROOMS}/${classroomId}/payments/${paymentId}`,
    },

    // --- Historique global des paiements ---
    PAYMENTS: {
      LIST: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.PAYMENTS}`,
      HISTORIES: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.PAYMENTS}/${ROUTES.FIN.PAYMENTS_HISTORIES}`,
      DETAIL: (paymentId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.PAYMENTS}/${paymentId}`,
    },

    // --- Taux de change quotidiens ---
    EXCHANGE_RATES: {
      LIST: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.EXCHANGE_RATES}`,
      NEW: `${ROUTES.FIN.ROOT}/${ROUTES.FIN.EXCHANGE_RATES}/new`,
      EDIT: (rateId: string | number) =>
        `${ROUTES.FIN.ROOT}/${ROUTES.FIN.EXCHANGE_RATES}/${rateId}/edit`,
    },
  },
} as const;

export type AppRoutes = typeof APP_ROUTES;
export type RouteParams = {
  sessionId?: string | number;
  localroomId?: string | number;
  classroomId?: string | number;
};
