import { School, User, StudyYear, Option } from "./identity.models";
import {
  ClassRoom,
  ClassroomEnrolement,
  ClassroomEnrolementAction,
} from "./academic.models";
import { LocalRoom, SeatingAssignment, SeatingSession } from "./seating.models";

/**
 * Initializes all Sequelize associations.
 * Should be called once at application startup.
 */
export const setupAssociations = () => {
  // School Relationships
  School.hasMany(User, { foreignKey: "schoolId" });
  User.belongsTo(School, { foreignKey: "schoolId" });

  School.hasMany(Option, { foreignKey: "schoolId" });
  Option.belongsTo(School, { foreignKey: "schoolId" });

  School.hasMany(StudyYear, { foreignKey: "schoolId" });
  StudyYear.belongsTo(School, { foreignKey: "schoolId" });

  School.hasMany(ClassRoom, { foreignKey: "schoolId" });
  ClassRoom.belongsTo(School, { foreignKey: "schoolId" });

  School.hasMany(ClassroomEnrolement, { foreignKey: "schoolId" });
  ClassroomEnrolement.belongsTo(School, { foreignKey: "schoolId" });

  // Option Relationships
  Option.hasMany(ClassRoom, { foreignKey: "optionId" });
  ClassRoom.belongsTo(Option, { foreignKey: "optionId" });

  // StudyYear Relationships
  StudyYear.hasMany(ClassRoom, { foreignKey: "yearId" });
  ClassRoom.belongsTo(StudyYear, { foreignKey: "yearId" });

  //

  StudyYear.hasMany(ClassroomEnrolement, { foreignKey: "yearId" });
  ClassroomEnrolement.belongsTo(StudyYear, { foreignKey: "yearId" });

  // ClassRoom Relationships
  ClassRoom.hasMany(ClassroomEnrolement, { foreignKey: "classroomId" });
  ClassroomEnrolement.belongsTo(ClassRoom, { foreignKey: "classroomId" });

  // User (Student) Relationships
  User.hasMany(ClassroomEnrolement, { foreignKey: "studentId" });
  ClassroomEnrolement.belongsTo(User, { foreignKey: "studentId" });

  ClassroomEnrolement.hasMany(ClassroomEnrolementAction, {
    foreignKey: "enrolementId",
  });
  ClassroomEnrolementAction.belongsTo(ClassroomEnrolement, {
    foreignKey: "enrolementId",
  });

  // SeatingSession Relationships
  SeatingSession.hasMany(SeatingAssignment, { foreignKey: "sessionId" });
  SeatingAssignment.belongsTo(SeatingSession, { foreignKey: "sessionId" });

  // LocalRoom Relationships
  LocalRoom.hasMany(SeatingAssignment, { foreignKey: "localRoomId" });
  SeatingAssignment.belongsTo(LocalRoom, { foreignKey: "localRoomId" });

  // Student (ClassroomEnrolement) Relationships
  ClassroomEnrolement.hasMany(SeatingAssignment, { foreignKey: "classroomId" });
  SeatingAssignment.belongsTo(ClassroomEnrolement, {
    foreignKey: "classroomId",
  });
};
