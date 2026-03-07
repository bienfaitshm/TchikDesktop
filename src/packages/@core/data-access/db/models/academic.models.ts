import { BelongsToGetAssociationMixin, DataTypes, Model } from "sequelize";
import { sequelize } from "../config";
import { primaryKeyColumn } from "../base";
import { SECTION, STUDENT_STATUS, ENROLEMENT_ACTION } from "../enum";
import { generateNumericEnrollmentCode } from "../utils";
import { Option, StudyYear, User } from "./identity.models";
import type {
  TClassroom,
  TEnrolement,
  ClassroomEnrolementActionAttributes,
  TClassroomCreate,
  TEnrolementCreate,
  TEnrolementActionCreate,
} from "./types";

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
  },
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
  },
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
  },
);
