export const ShoolRouteIds = {
  findAllSchools: "school.find.all",
  findSchoolById: "school.find.byId",
  findAllSchoolYears: "school.studyYears.find.all",
  findStudyYearById: "school.studyYears.find.byId",
} as const;

export const ClassroomIds = {
  findAllClassrooms: "classroom.find.all",
  findClassroomById: "classroom.find.byId",
  findAllClassroomsWithEnrollment: "classroom.find.all.enrollement",
} as const;
