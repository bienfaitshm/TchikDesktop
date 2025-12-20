import {
  DataTypes,
  Model,
  type HasManyGetAssociationsMixin,
  type BelongsToGetAssociationMixin,
} from "sequelize";
import {
  ENROLEMENT_ACTION,
  SECTION,
  STUDENT_STATUS,
  USER_GENDER,
  USER_ROLE,
} from "./enum";
import { sequelize } from "./config";
import { primaryKeyColumn } from "./base";
import {
  generateNumericEnrollmentCode,
  generateProvisionalUsername,
} from "./utils";
import type {
  SchoolAttributes,
  OptionAttributes,
  StudyYearAttributes,
  TClassroom,
  TEnrolement,
  TUser,
  ClassroomEnrolementActionAttributes,
} from "./model.type";

import type {
  TOptionCreate,
  TClassroomCreate,
  TUserCreate,
  TEnrolementCreate,
  TSchoolCreate,
  TStudyYearCreate,
  TEnrolementActionCreate,
} from "./model.action.type";

// =============================================================================
//  1. SCHOOL MODEL
// =============================================================================

/**
 * Entité racine représentant un établissement scolaire.
 * @table Schools
 */
export class School extends Model<SchoolAttributes, TSchoolCreate> {
  public schoolId!: string;
  public name!: string;
  public adress!: string;
  public town!: string;
  public logo?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations Mixins (Type Safety pour les relations)
  public getUsers!: HasManyGetAssociationsMixin<User>;
  public getOptions!: HasManyGetAssociationsMixin<Option>;
  public getStudyYears!: HasManyGetAssociationsMixin<StudyYear>;
  public getClassrooms!: HasManyGetAssociationsMixin<ClassRoom>;
}

School.init(
  {
    schoolId: primaryKeyColumn({ field: "school_id" }),
    name: { type: DataTypes.STRING, allowNull: false, field: "name" },
    adress: { type: DataTypes.STRING, allowNull: false, field: "adress" },
    town: { type: DataTypes.STRING, allowNull: false, field: "town" },
    logo: { type: DataTypes.STRING, allowNull: true, field: "logo" },
  },
  {
    sequelize,
    tableName: "Schools",
    modelName: "School",
  }
);

// =============================================================================
//  2. USER MODEL
// =============================================================================

/**
 * Utilisateur central (Étudiant, Admin, Professeur).
 * Gère l'authentification et l'identité.
 * @table Users
 */
export class User extends Model<TUser, TUserCreate> {
  public userId!: string;
  public lastName!: string;
  public middleName!: string;
  public firstName!: string | null;
  public fullname!: string;
  public username!: string;
  public password!: string;
  public gender!: USER_GENDER;
  public role!: USER_ROLE;
  public birthDate!: string | null;
  public birthPlace!: string | null;

  // Clés étrangères
  public schoolId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getSchool!: BelongsToGetAssociationMixin<School>;
  public getEnrolments!: HasManyGetAssociationsMixin<ClassroomEnrolement>;
}

User.init(
  {
    userId: primaryKeyColumn({ field: "user_id" }),
    lastName: { type: DataTypes.STRING, allowNull: false, field: "last_name" },
    middleName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "middle_name",
    },
    firstName: { type: DataTypes.STRING, allowNull: true, field: "first_name" },

    // Champ Virtuel : Concaténation automatique
    fullname: {
      type: DataTypes.VIRTUAL,
      get() {
        const first = this.getDataValue("firstName") ?? "";
        return `${this.getDataValue("lastName")} ${this.getDataValue("middleName")} ${first}`.toUpperCase();
      },
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "username",
      defaultValue: generateProvisionalUsername,
      set(val: string) {
        // Logique métier pour le préfixe de rôle
        // Note: on utilise `this.role` si disponible, sinon on suppose qu'il est set avant
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
    schoolId: { type: DataTypes.STRING, allowNull: false, field: "school_id" },
  },
  {
    sequelize,
    tableName: "Users",
    modelName: "User",
  }
);

// =============================================================================
//  3. OPTION MODEL
// =============================================================================

/**
 * Filière ou option d'étude (ex: Scientifique, Littéraire).
 * @table Options
 */
export class Option extends Model<OptionAttributes, TOptionCreate> {
  public optionId!: string;
  public optionName!: string;
  public optionShortName!: string;
  public section!: SECTION;
  public schoolId!: string;

  // Note: timestamps: false dans le modèle original
}

Option.init(
  {
    optionId: primaryKeyColumn({ field: "option_id" }),
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
    schoolId: { type: DataTypes.STRING, allowNull: false, field: "school_id" },
  },
  {
    sequelize,
    tableName: "Options",
    modelName: "Option",
    timestamps: false,
  }
);

// =============================================================================
//  4. STUDY YEAR MODEL
// =============================================================================

/**
 * Année académique définissant les périodes scolaires.
 * @table StudyYears
 */
export class StudyYear
  extends Model<StudyYearAttributes, TStudyYearCreate>
  implements StudyYearAttributes
{
  public yearId!: string;
  public yearName!: string;
  public startDate!: Date;
  public endDate!: Date;
  public schoolId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudyYear.init(
  {
    yearId: primaryKeyColumn({ field: "year_id" }),
    yearName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "year_name",
    },
    startDate: { type: DataTypes.DATE, allowNull: false, field: "start_date" },
    endDate: { type: DataTypes.DATE, allowNull: false, field: "end_date" },
    schoolId: { type: DataTypes.STRING, allowNull: false, field: "school_id" },
  },
  {
    sequelize,
    tableName: "StudyYears",
    modelName: "StudyYear",
  }
);

// =============================================================================
//  5. CLASSROOM MODEL
// =============================================================================

/**
 * Classe physique/logique (ex: 3ème A).
 * @table ClassRooms
 */
export class ClassRoom
  extends Model<TClassroom, TClassroomCreate>
  implements TClassroom
{
  public classId!: string;
  public identifier!: string;
  public shortIdentifier!: string;
  public section!: SECTION;

  // Clés étrangères
  public yearId!: string;
  public optionId!: string | null;
  public schoolId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getOption!: BelongsToGetAssociationMixin<Option>;
  public getYear!: BelongsToGetAssociationMixin<StudyYear>;
}

ClassRoom.init(
  {
    classId: primaryKeyColumn({ field: "class_id" }),
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
    yearId: { type: DataTypes.STRING, allowNull: false, field: "year_id" },
    optionId: { type: DataTypes.STRING, allowNull: true, field: "option_id" },
    schoolId: { type: DataTypes.STRING, allowNull: false, field: "school_id" },
  },
  {
    sequelize,
    tableName: "ClassRooms",
    modelName: "ClassRoom",
  }
);

// =============================================================================
//  6. CLASSROOM ENROLEMENT MODEL
// =============================================================================

/**
 * Inscription d'un étudiant à une classe pour une période donnée.
 * @table ClassroomEnrolements
 */
export class ClassroomEnrolement extends Model<TEnrolement, TEnrolementCreate> {
  public enrolementId!: string;
  public classroomId!: string;
  public status!: STUDENT_STATUS;
  public isNewStudent!: boolean;
  public code!: string;
  public studentId!: string;
  public schoolId!: string;

  public yearId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getStudent!: BelongsToGetAssociationMixin<User>;
  public getClassroom!: BelongsToGetAssociationMixin<ClassRoom>;
}

ClassroomEnrolement.init(
  {
    enrolementId: primaryKeyColumn({ field: "enrolement_id" }),
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
      defaultValue: generateNumericEnrollmentCode,
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "student_id",
    },
    schoolId: { type: DataTypes.STRING, allowNull: false, field: "school_id" },
    yearId: { type: DataTypes.STRING, allowNull: false, field: "year_id" },
  },
  {
    sequelize,
    tableName: "ClassroomEnrolements",
    modelName: "ClassroomEnrolement",
  }
);

// =============================================================================
//  7. CLASSROOM ENROLEMENT ACTION MODEL (NOUVEAU)
// =============================================================================

/**
 * Enregistre l'historique des actions ou changements de statut pour une inscription spécifique.
 * Sert de piste d'audit pour le statut de l'étudiant.
 * @table ClassroomEnrolementActions
 */
export class ClassroomEnrolementAction
  extends Model<ClassroomEnrolementActionAttributes, TEnrolementActionCreate>
  implements ClassroomEnrolementActionAttributes
{
  public actionId!: string;
  public enrolementId!: string;
  public reason?: string;
  public action!: ENROLEMENT_ACTION;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClassroomEnrolementAction.init(
  {
    actionId: primaryKeyColumn({ field: "action_id" }),
    enrolementId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "enrolement_id",
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "reason",
    },
    action: {
      type: DataTypes.ENUM(...Object.values(ENROLEMENT_ACTION)),
      allowNull: false,
      field: "action",
    },
  },
  {
    sequelize,
    tableName: "ClassroomEnrolementActions",
    modelName: "ClassroomEnrolementAction",
  }
);

// =============================================================================
//  8. RELATIONS (ASSOCIATIONS)
// =============================================================================

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

// =============================================================================
//  EXPORTS
// =============================================================================

export { sequelize };
