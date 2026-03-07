import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config";
import { primaryKeyColumn } from "../base";

/**
 * Represents a physical room with a defined grid (rows/columns).
 */
export class LocalRoom extends Model {
  public localRoomId!: string;
  public name!: string;
  public maxCapacity!: number;
  public totalRows!: number;
  public totalColumns!: number;
  public schoolId!: string;
}

LocalRoom.init(
  {
    localRoomId: primaryKeyColumn({ field: "local_room_id" }),
    name: { type: DataTypes.STRING, allowNull: false },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "max_capacity",
    },
    totalRows: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "total_rows",
    },
    totalColumns: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "total_columns",
    },
    schoolId: { type: DataTypes.STRING, allowNull: false, field: "school_id" },
  },
  { sequelize, tableName: "LocalRooms", modelName: "LocalRoom" },
);

/**
 * Represents a specific event (e.g., "Annual Exam 2026").
 */
export class SeatingSession extends Model {
  public sessionId!: string;
  public sessionName!: string;
  public schoolId!: string;
  public yearId!: string;
}

SeatingSession.init(
  {
    sessionId: primaryKeyColumn({ field: "session_id" }),
    sessionName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "session_name",
    },
    schoolId: { type: DataTypes.STRING, allowNull: false, field: "school_id" },
    yearId: { type: DataTypes.STRING, allowNull: false, field: "year_id" },
  },
  { sequelize, tableName: "SeatingSessions", modelName: "SeatingSession" },
);

/**
 * Join table mapping students to specific seats in a room for a session.
 */
export class SeatingAssignment extends Model {
  public assignmentId!: string;
  public sessionId!: string;
  public localRoomId!: string;
  public enrolementId!: string;
  public rowPosition!: number;
  public columnPosition!: number;
}

SeatingAssignment.init(
  {
    assignmentId: primaryKeyColumn({ field: "assignment_id" }),
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "session_id",
    },
    localRoomId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "local_room_id",
    },
    enrolementId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "classroom_id",
    },
    rowPosition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "row_position",
    },
    columnPosition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "column_position",
    },
  },
  {
    sequelize,
    tableName: "SeatingAssignments",
    modelName: "SeatingAssignment",
    indexes: [
      { unique: true, fields: ["session_id", "student_id"] },
      {
        unique: true,
        fields: [
          "session_id",
          "local_room_id",
          "row_position",
          "column_position",
        ],
      },
    ],
  },
);
