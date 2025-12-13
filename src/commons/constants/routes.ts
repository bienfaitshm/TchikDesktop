export const DOCUMENT_EXPORT_ROUTES = {
  GET_INFOS: "export/documents/infos",
  EXPORT_DOCUMENT: "export/documents",
} as const;

export const IPCApiRoutes = {
  classrooms: "/classes",
  classroom: "/classes/:classId",
  schools: "/schools",
  school: "/schools/schoolId",
  studyYears: "/study-years",
  studyYear: "/study-years/:yearId",
} as const;
