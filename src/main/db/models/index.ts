import { DataTypes, Model, BuildOptions } from "sequelize";
import {
  SECTION,
  STUDENT_STATUS,
  USER_GENDER,
  USER_ROLE,
} from "@/camons/constants/enum";
import { sequelize } from "../config";
import { PRIMARY_KEY, primaryKey } from "./base";
import { getDefaultEnrolementCode, getDefaultUsername } from "./utils";
import type {
  SchoolAttributes,
  OptionAttributes,
  StudyYearAttributes,
  UserAttributes,
  TClassroomInsert,
  TClassroom,
  TEnrolement,
  TEnrolementInsert,
  TUserInsert,
  TUser,
} from "@/camons/types/models";

// =====================
// MODEL TYPES
// =====================

type ModelStatic<
  Attributes extends {},
  InsertAttributes extends {} = {},
> = typeof Model & {
  new (
    values?: object,
    options?: BuildOptions
  ): Model<Attributes, InsertAttributes> & Attributes;
};

// =====================
// MODELS
// =====================

const School = sequelize.define(
  "School",
  {
    schoolId: primaryKey({ field: "school_id" }),
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
    userId: primaryKey({ field: "user_id" }),
    lastName: { type: DataTypes.STRING, allowNull: false, field: "last_name" },
    middleName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "middle_name",
    },
    firstName: { type: DataTypes.STRING, allowNull: true, field: "first_name" },
    fullname: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.lastName} ${this.middleName} ${this.lastName ?? ""}`;
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "username",
      defaultValue: getDefaultUsername,
      set(val: string) {
        this.setDataValue("username", `${this.role}_${val}`);
      },
    },
    password: { type: DataTypes.STRING, allowNull: false, field: "password" },
    gender: {
      type: DataTypes.ENUM(...Object.values(USER_GENDER)),
      allowNull: false,
      field: "gender",
      defaultValue: USER_GENDER.MALE,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLE)),
      allowNull: false,
      field: "role",
      defaultValue: USER_ROLE.STUDENT,
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
) as ModelStatic<TUser, TUserInsert>;

const Option = sequelize.define(
  "Option",
  {
    optionId: primaryKey({ field: "option_id" }),
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
      defaultValue: SECTION.SECONDARY,
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
    yearId: primaryKey({ field: "year_id" }),
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
    classId: primaryKey({ field: "class_id" }),
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
) as ModelStatic<TClassroom, TClassroomInsert>;

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
      defaultValue: getDefaultEnrolementCode,
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
) as ModelStatic<TEnrolement, TEnrolementInsert>;

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
