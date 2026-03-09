import {
  BelongsToGetAssociationMixin,
  DataTypes,
  HasManyGetAssociationsMixin,
  Model,
} from "sequelize";
import { sequelize } from "../config";
import { primaryKeyColumn } from "../base";
import { USER_GENDER, USER_ROLE, SECTION } from "../enum";
import { generateProvisionalUsername } from "../utils";
import type {
  SchoolAttributes,
  TUser,
  OptionAttributes,
  StudyYearAttributes,
  TSchoolCreate,
  TUserCreate,
  TOptionCreate,
  TStudyYearCreate,
} from "./types";

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
  },
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
  },
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
  },
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
  },
);
