import { relations } from "drizzle-orm";
import {
  exportHistories,
  schools,
  users,
  classroomEnrollmentActions,
  classroomEnrollments,
} from "./schema";

export const classroomEnrollmentActionsRelations = relations(
  classroomEnrollmentActions,
  ({ one }) => ({
    enrollment: one(classroomEnrollments, {
      fields: [classroomEnrollmentActions.enrollmentId],
      references: [classroomEnrollments.enrollmentId],
    }),
  }),
);

export const exportHistoriesRelations = relations(
  exportHistories,
  ({ one }) => ({
    school: one(schools, {
      fields: [exportHistories.schoolId],
      references: [schools.schoolId],
    }),
    user: one(users, {
      fields: [exportHistories.userId],
      references: [users.userId],
    }),
  }),
);
