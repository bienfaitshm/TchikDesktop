import { DataTypes, Model, BuildOptions } from "sequelize";
import {
  SECTION,
  STUDENT_STATUS,
  USER_GENDER,
  USER_ROLE,
} from "@/camons/constants/enum";
import { sequelize } from "../config";
import { PRIMARY_KEY } from "./base";
import type {
  SchoolAttributes,
  ClassAttributes,
  ClassroomEnrolementAttributes,
  OptionAttributes,
  StudyYearAttributes,
  UserAttributes,
} from "@/camons/types/models";

// =====================
// MODEL TYPES
// =====================

type ModelStatic<T extends {}> = typeof Model & {
  new (values?: object, options?: BuildOptions): Model<T> & T;
};

// =====================
// MODELS
// =====================

const School = sequelize.define(
  "School",
  {
    schoolId: {
      ...PRIMARY_KEY,
      field: "school_id",
    },
    name: { type: DataTypes.STRING, allowNull: false, field: "name" },
    adress: { type: DataTypes.STRING, allowNull: false, field: "adress" },
    town: { type: DataTypes.STRING, allowNull: false, field: "town" },
    logo: { type: DataTypes.STRING, allowNull: true, field: "logo" },
  },
  { tableName: "Schools" }
) as ModelStatic<SchoolAttributes>;

const User = sequelize.define(
  "User",
  {
    userId: {
      ...PRIMARY_KEY,
      field: "user_id",
    },
    lastName: { type: DataTypes.STRING, allowNull: false, field: "last_name" },
    middleName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "middle_name",
    },
    firstName: { type: DataTypes.STRING, allowNull: true, field: "first_name" },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "username",
    },
    password: { type: DataTypes.STRING, allowNull: false, field: "password" },
    gender: {
      type: DataTypes.ENUM(...Object.values(USER_GENDER)),
      allowNull: false,
      field: "gender",
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLE)),
      allowNull: false,
      field: "role",
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "birth_date",
    },
    birthPlace: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "birth_place",
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "school_id",
    },
  },
  { tableName: "Users" }
) as ModelStatic<UserAttributes>;

const Option = sequelize.define(
  "Option",
  {
    optionId: {
      ...PRIMARY_KEY,
      field: "option_id",
    },
    optionName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "option_name",
    },
    optionShortName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "option_short_name",
    },
    section: {
      type: DataTypes.ENUM(...Object.values(SECTION)),
      allowNull: false,
      field: "section",
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "school_id",
    },
  },
  { tableName: "Options", timestamps: false }
) as ModelStatic<OptionAttributes>;

const StudyYear = sequelize.define(
  "StudyYear",
  {
    yearId: {
      ...PRIMARY_KEY,
      field: "year_id",
    },
    yearName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "year_name",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_date",
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "school_id",
    },
  },
  { tableName: "StudyYears" }
) as ModelStatic<StudyYearAttributes>;

const ClassRoom = sequelize.define(
  "ClassRoom",
  {
    classId: {
      ...PRIMARY_KEY,
      field: "class_id",
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "identifier",
    },
    shortIdentifier: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "short_identifier",
    },
    section: {
      type: DataTypes.ENUM(...Object.values(SECTION)),
      allowNull: false,
      field: "section",
    },
    yearId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "year_id",
    },
    optionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "option_id",
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "school_id",
    },
  },
  { tableName: "ClassRooms" }
) as ModelStatic<ClassAttributes>;

const ClassroomEnrolement = sequelize.define(
  "ClassroomEnrolement",
  {
    enrolementId: {
      ...PRIMARY_KEY,
      field: "enrolement_id",
    },
    classroomId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "classroom_id",
    },
    status: {
      type: DataTypes.ENUM(...Object.values(STUDENT_STATUS)),
      allowNull: false,
      field: "status",
      defaultValue: STUDENT_STATUS.EN_COURS,
    },
    isNewStudent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_new_student",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "student_code",
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "student_id",
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "school_id",
    },
  },
  { tableName: "ClassroomEnrolements" }
) as ModelStatic<ClassroomEnrolementAttributes>;

// =====================
// RELATIONS
// =====================

// School relations
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

// Option relations
Option.hasMany(ClassRoom, { foreignKey: "optionId" });
ClassRoom.belongsTo(Option, { foreignKey: "optionId" });

// StudyYear relations
StudyYear.hasMany(ClassRoom, { foreignKey: "yearId" });
ClassRoom.belongsTo(StudyYear, { foreignKey: "yearId" });

// ClassRoom relations
ClassRoom.hasMany(ClassroomEnrolement, { foreignKey: "classroomId" });
ClassroomEnrolement.belongsTo(ClassRoom, { foreignKey: "classroomId" });

// User/ClassroomEnrolement relations
User.hasMany(ClassroomEnrolement, { foreignKey: "studentId" });
ClassroomEnrolement.belongsTo(User, { foreignKey: "studentId" });

// =====================
// EXPORTS
// =====================

export {
  sequelize,
  User,
  Option,
  StudyYear,
  ClassRoom,
  School,
  ClassroomEnrolement,
};
