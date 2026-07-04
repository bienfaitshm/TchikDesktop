export const ROUTES = {
  HOME: "/",
  ENROLLMENTS: "/inscriptions",
  OPTIONS: "/options",
  LOCALS: "/locals",
  STUDY_YEARS: "/school-years",
  SCHOOLS: "/schools",

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
  FIN: {
    DASHBOARD: "/fin/dashboard",
    WALLET: "/fin/wallets",
    PAYMENT_CONFIG: "/fin/config",
    FEE_TYPE: "/fin/fee-types",
    CLASSROOMS: "/fin/classrooms",
    PAYMENTS: "/fin/payments",
    PAYMENTS_HISTORIES: "histories",
    EXCHANGE_RATES: "/fin/exchange-rates",
  },
} as const;

export const APP_ROUTES = {
  HOME: ROUTES.HOME,
  ENROLLMENTS: ROUTES.ENROLLMENTS,
  OPTIONS: ROUTES.OPTIONS,
  LOCALS: ROUTES.LOCALS,
  SCHOOL_YEARS: ROUTES.STUDY_YEARS,
  SCHOOLS: ROUTES.SCHOOLS,

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
  FIN: {
    DASHBOARD: ROUTES.FIN.DASHBOARD,

    // --- Portefeuilles (wallets) ---
    WALLETS: {
      LIST: ROUTES.FIN.WALLET,
      DETAIL: (walletId: string | number) => `${ROUTES.FIN.WALLET}/${walletId}`,
      NEW: `${ROUTES.FIN.WALLET}/new`,
      EDIT: (walletId: string | number) =>
        `${ROUTES.FIN.WALLET}/${walletId}/edit`,
    },

    // --- Types de frais ---
    FEE_TYPES: {
      LIST: ROUTES.FIN.FEE_TYPE,
      DETAIL: (feeTypeId: string | number) =>
        `${ROUTES.FIN.FEE_TYPE}/${feeTypeId}`,
      NEW: `${ROUTES.FIN.FEE_TYPE}/new`,
      EDIT: (feeTypeId: string | number) =>
        `${ROUTES.FIN.FEE_TYPE}/${feeTypeId}/edit`,
    },

    // --- Configurations de frais ---
    PAYMENT_CONFIGS: {
      LIST: ROUTES.FIN.PAYMENT_CONFIG,
      DETAIL: (feeConfigId: string | number) =>
        `${ROUTES.FIN.PAYMENT_CONFIG}/${feeConfigId}`,
      NEW: `${ROUTES.FIN.PAYMENT_CONFIG}/new`,
      EDIT: (feeConfigId: string | number) =>
        `${ROUTES.FIN.PAYMENT_CONFIG}/${feeConfigId}/edit`,
    },

    // --- Gestion par classe (affectations + paiements) ---
    CLASSROOMS: {
      LIST: ROUTES.FIN.CLASSROOMS,
      DETAIL: (classroomId: string | number) =>
        `${ROUTES.FIN.CLASSROOMS}/${classroomId}`,

      // Affectations des échéanciers aux élèves d’une classe
      ASSIGNMENTS: (classroomId: string | number) =>
        `${ROUTES.FIN.CLASSROOMS}/${classroomId}/assignments`,
      ASSIGNMENT_NEW: (classroomId: string | number) =>
        `${ROUTES.FIN.CLASSROOMS}/${classroomId}/assignments/new`,
      ASSIGNMENT_EDIT: (
        classroomId: string | number,
        assignmentId: string | number,
      ) =>
        `${ROUTES.FIN.CLASSROOMS}/${classroomId}/assignments/${assignmentId}/edit`,

      // Paiements effectués par les élèves d’une classe
      PAYMENTS: (classroomId: string | number) =>
        `${ROUTES.FIN.CLASSROOMS}/${classroomId}/payments`,
      PAYMENT_DETAIL: (
        classroomId: string | number,
        paymentId: string | number,
      ) => `${ROUTES.FIN.CLASSROOMS}/${classroomId}/payments/${paymentId}`,
    },

    // --- Historique global des paiements ---
    PAYMENTS: {
      LIST: ROUTES.FIN.PAYMENTS,
      HISTORIES: `${ROUTES.FIN.PAYMENTS}/${ROUTES.FIN.PAYMENTS_HISTORIES}`,
      DETAIL: (paymentId: string | number) =>
        `${ROUTES.FIN.PAYMENTS}/${paymentId}`,
    },

    // --- Taux de change quotidiens ---
    EXCHANGE_RATES: {
      LIST: ROUTES.FIN.EXCHANGE_RATES,
      NEW: `${ROUTES.FIN.EXCHANGE_RATES}/new`,
      EDIT: (rateId: string | number) =>
        `${ROUTES.FIN.EXCHANGE_RATES}/${rateId}/edit`,
    },
  },
} as const;

export type AppRoutes = typeof APP_ROUTES;
export type RouteParams = {
  sessionId?: string | number;
  localroomId?: string | number;
  classroomId?: string | number;
};
