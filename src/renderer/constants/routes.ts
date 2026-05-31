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
} as const;

export type AppRoutes = typeof APP_ROUTES;
export type RouteParams = {
  sessionId?: string | number;
  localroomId?: string | number;
  classroomId?: string | number;
};
