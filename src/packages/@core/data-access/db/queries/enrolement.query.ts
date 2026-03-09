import {
  ClassroomEnrolement,
  User,
  ClassRoom,
  StudyYear,
  Option,
  buildFindOptions,
  type TEnrolement,
  type TUser,
  type TClassroom,
  type TStudyYear,
  STUDENT_STATUS,
} from "@/packages/@core/data-access/db";
import { getLogger } from "@/packages/logger";
import type {
  TEnrolementFilter,
  TEnrolementQuickCreate,
  TEnrolementCreate,
  TEnrolementUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { Sequelize, FindOptions } from "sequelize";

import { UserQuery } from "./user.query";

export interface IClassCountResult {
  classroomId: string;
  value: number;
}

export interface IOptionCountResult {
  value: number;
  optionShortName?: string;
}

export type TEnrolementDTO = TEnrolement & {
  user: TUser;
  classroom: TClassroom & { studyYear: TStudyYear };
};

const logger = getLogger("Enrolement Query");

const DEFAULT_SORT_ORDER: FindOptions["order"] = [
  [Sequelize.fn("LOWER", Sequelize.col("user.last_name")), "ASC"],
  [Sequelize.fn("LOWER", Sequelize.col("user.middle_name")), "ASC"],
  [Sequelize.fn("LOWER", Sequelize.col("user.first_name")), "ASC"],
];

export class EnrolementQuery {
  private static getFilterOptions(
    filters: TEnrolementFilter,
    orders?: FindOptions["order"],
  ) {
    if (!filters.schoolId || !filters.yearId) {
      throw new Error("Validation Error: schoolId and yearId are required.");
    }
    return buildFindOptions(filters, orders);
  }

  static async findMany(filters: TEnrolementFilter): Promise<TEnrolementDTO[]> {
    try {
      const options = this.getFilterOptions(filters, DEFAULT_SORT_ORDER);
      const enrolements = await ClassroomEnrolement.findAll({
        ...options,
        include: [
          { model: User, as: "user" },
          {
            model: ClassRoom,
            as: "classroom",
            include: [{ model: StudyYear, as: "studyYear" }],
            required: true,
          },
        ],
        raw: true,
        nest: true,
      });
      return enrolements as unknown as TEnrolementDTO[];
    } catch (error) {
      logger.error("EnrolementQuery.findMany: DB query failed.", error);
      throw new Error("Database error while fetching enrolements.");
    }
  }

  static async getTotalStudents(filters: TEnrolementFilter): Promise<number> {
    try {
      const options = this.getFilterOptions(filters, DEFAULT_SORT_ORDER);
      return await ClassroomEnrolement.count(options);
    } catch (err) {
      logger.error("Failed to get total students", err);
      return 0;
    }
  }

  static async getStudentsCountByClass(
    filters: TEnrolementFilter,
  ): Promise<IClassCountResult[]> {
    try {
      const options = this.getFilterOptions(filters, [
        [Sequelize.col("classroom.short_identifier"), "ASC"],
      ]);

      const results = await ClassroomEnrolement.findAll({
        attributes: [
          "classroomId",
          [Sequelize.fn("COUNT", Sequelize.col("student_id")), "value"],
        ],
        ...options,
        include: [
          {
            model: ClassRoom,
            as: "classroom",
            attributes: ["identifier", "shortIdentifier"],
            required: true,
          },
        ],
        group: [
          Sequelize.col("ClassroomEnrolement.classroom_id"),
          Sequelize.col("classroom.class_id"),
        ],
        raw: true,
      });

      return results as unknown as IClassCountResult[];
    } catch (error) {
      logger.error("EnrolementQuery.getStudentsCountByClass failed", error);
      return [];
    }
  }

  static async findById(enrolementId: string): Promise<TEnrolementDTO | null> {
    if (!enrolementId) return null;
    try {
      const enrolement = await ClassroomEnrolement.findByPk(enrolementId, {
        include: [
          { model: User, as: "user" },
          { model: ClassRoom, as: "classroom" },
        ],
        raw: true,
        nest: true,
      });
      return enrolement as TEnrolementDTO | null;
    } catch (error) {
      logger.error(
        `EnrolementQuery.findById: Error for ID ${enrolementId}.`,
        error,
      );
      return null;
    }
  }

  static async getStudentsCountByOption(filters: TEnrolementFilter) {
    try {
      const options = this.getFilterOptions(filters);
      return await ClassroomEnrolement.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("student_id")), "value"],
        ],
        ...options,
        include: [
          {
            model: ClassRoom,
            as: "classroom",
            attributes: [],
            required: true,
            include: [
              {
                model: Option,
                as: "option",
                attributes: ["optionShortName"],
                required: true,
              },
            ],
          },
        ],
        group: [Sequelize.col("classroom->option.option_name")],
        order: [[Sequelize.col("classroom->option.option_short_name"), "ASC"]],
        raw: true,
      });
    } catch (error) {
      logger.error("EnrolementQuery.getStudentsCountByOption failed", error);
      return [];
    }
  }

  static async getRetentionMetrics(filters: TEnrolementFilter) {
    const options = this.getFilterOptions(filters);
    const include = [{ model: ClassRoom, as: "classroom", required: true }];

    const [total, news] = await Promise.all([
      ClassroomEnrolement.count({ ...options, include }),
      ClassroomEnrolement.count({
        where: { ...options.where, isNewStudent: true },
        include,
      }),
    ]);

    return { total, oldStudents: total - news, news };
  }

  static async getStudentStatusStats(filters: TEnrolementFilter) {
    try {
      const options = this.getFilterOptions(filters);
      return await ClassroomEnrolement.findAll({
        ...options,
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("enrolement_id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });
    } catch (error) {
      logger.error("EnrolementQuery.getStudentStatusStats failed", error);
      return [];
    }
  }

  static async getQuickKpis(filters: TEnrolementFilter) {
    const stats: any[] = await this.getStudentStatusStats(filters);
    const getCount = (status: string) =>
      Number(stats.find((s: any) => s.status === status)?.count || 0);

    return {
      total: stats.reduce(
        (acc: number, curr: any) => acc + Number(curr.count),
        0,
      ),
      active: getCount(STUDENT_STATUS.EN_COURS),
      excluded: getCount(STUDENT_STATUS.EXCLUT),
      inactive: getCount(STUDENT_STATUS.ABANDON),
    };
  }

  static async create(data: TEnrolementCreate): Promise<TEnrolement> {
    try {
      const enrolement = await ClassroomEnrolement.create(data, { raw: true });
      logger.info(`Enrolement created: ${enrolement.enrolementId}`, {
        studentId: data.studentId,
        classId: enrolement.classroomId,
      });
      return enrolement;
    } catch (error) {
      logger.error("EnrolementQuery.create: Creation failed.", error);
      throw error;
    }
  }

  static async quickCreate({
    student,
    isInSystem,
    studentId,
    ...enrolementData
  }: TEnrolementQuickCreate): Promise<TEnrolement> {
    const transaction = await ClassroomEnrolement.sequelize!.transaction();

    try {
      let finalStudentId = studentId;

      if (isInSystem && studentId) {
        const existingStudent = await UserQuery.findById(studentId);
        if (!existingStudent)
          throw new Error("Validation Error: L'élève n'existe pas.");
      } else if (!isInSystem && student) {
        const newStudent = await UserQuery.create(
          { ...student, schoolId: enrolementData.schoolId },
          { transaction },
        );
        finalStudentId = newStudent.userId;
      } else {
        throw new Error("Validation Error: Données de l'élève manquantes.");
      }

      const enrolement = await ClassroomEnrolement.create(
        { ...enrolementData, studentId: finalStudentId! },
        { transaction, raw: true },
      );

      await transaction.commit();
      logger.info(`Quick Create Success for student: ${finalStudentId}`);

      return enrolement;
    } catch (error) {
      await transaction.rollback();
      logger.error("quickCreate transaction failed and rolled back.", error);
      throw error;
    }
  }

  static async update(
    enrolementId: string,
    data: TEnrolementUpdate,
  ): Promise<TEnrolement | null> {
    if (!enrolementId) return null;

    try {
      const enrolement = await ClassroomEnrolement.findByPk(enrolementId);
      if (!enrolement) {
        logger.warn(`EnrolementQuery.update: ID ${enrolementId} not found.`);
        return null;
      }
      const updatedEnrolement = await enrolement.update(data, { raw: true });
      return updatedEnrolement;
    } catch (error) {
      logger.error(
        `EnrolementQuery.update: Error updating ${enrolementId}.`,
        error,
      );
      throw new Error("Update operation failed.");
    }
  }

  static async delete(enrolementId: string): Promise<boolean> {
    if (!enrolementId) return false;

    try {
      const deletedRowCount = await ClassroomEnrolement.destroy({
        where: { enrolementId },
      });
      return deletedRowCount > 0;
    } catch (error) {
      logger.error(
        `EnrolementQuery.delete: Error deleting ${enrolementId}.`,
        error,
      );
      throw new Error("Delete operation failed.");
    }
  }
}
