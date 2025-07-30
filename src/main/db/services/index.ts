// import { Op } from "sequelize";
import {
  School,
  User,
  Option,
  StudyYear,
  ClassRoom,
  ClassroomEnrolement,
} from "../models"; // Adjust path to your models file
import {
  ClassAttributes,
  ClassroomEnrolementAttributes,
  OptionAttributes,
  SchoolAttributes,
  StudyYearAttributes,
  UserAttributes,
  WithSchoolAndYearId,
  WithSchoolId,
} from "./types";

// --- School CRUD ---
export const SchoolService = {
  create: async (data: SchoolAttributes) => {
    return School.create(data);
  },
  findAll: async () => {
    return School.findAll();
  },
  findById: async (schoolId: string) => {
    return School.findByPk(schoolId);
  },
  update: async (schoolId: string, data: Partial<SchoolAttributes>) => {
    const school = await School.findByPk(schoolId);
    if (!school) return null;
    return school.update(data);
  },
  delete: async (schoolId: string) => {
    const school = await School.findByPk(schoolId);
    if (!school) return false;
    await school.destroy();
    return true;
  },
};

// --- User CRUD ---
export const UserService = {
  create: async (data: WithSchoolId<UserAttributes>) => {
    return User.create(data);
  },
  findAll: async (schoolId: string) => {
    return User.findAll({ where: { schoolId }, include: [School] });
  },
  findById: async (schoolId: string, userId: string) => {
    return User.findOne({ where: { userId, schoolId }, include: [School] });
  },
  update: async (
    schoolId: string,
    userId: string,
    data: Partial<UserAttributes>
  ) => {
    const user = await User.findOne({ where: { userId, schoolId } });
    if (!user) return null;
    return user.update(data);
  },
  delete: async (schoolId: string, userId: string) => {
    const user = await User.findOne({ where: { userId, schoolId } });
    if (!user) return false;
    await user.destroy();
    return true;
  },
};

// --- Option CRUD ---
export const OptionService = {
  create: async (data: WithSchoolId<OptionAttributes>) => {
    return Option.create(data);
  },
  findAll: async (schoolId: string) => {
    return Option.findAll({ where: { schoolId }, include: [School] });
  },
  findById: async (schoolId: string, optionId: string) => {
    return Option.findOne({ where: { optionId, schoolId }, include: [School] });
  },
  update: async (
    schoolId: string,
    optionId: string,
    data: Partial<OptionAttributes>
  ) => {
    const option = await Option.findOne({ where: { optionId, schoolId } });
    if (!option) return null;
    return option.update(data);
  },
  delete: async (schoolId: string, optionId: string) => {
    const option = await Option.findOne({ where: { optionId, schoolId } });
    if (!option) return false;
    await option.destroy();
    return true;
  },
};

// --- StudyYear CRUD ---
export const StudyYearService = {
  create: async (data: WithSchoolId<StudyYearAttributes>) => {
    return StudyYear.create(data);
  },
  findAll: async (schoolId: string) => {
    return StudyYear.findAll({ where: { schoolId }, include: [School] });
  },
  findById: async (schoolId: string, yearId: string) => {
    return StudyYear.findOne({
      where: { yearId, schoolId },
      include: [School],
    });
  },
  update: async (
    schoolId: string,
    yearId: string,
    data: Partial<StudyYearAttributes>
  ) => {
    const studyYear = await StudyYear.findOne({ where: { yearId, schoolId } });
    if (!studyYear) return null;
    return studyYear.update(data);
  },
  delete: async (schoolId: string, yearId: string) => {
    const studyYear = await StudyYear.findOne({ where: { yearId, schoolId } });
    if (!studyYear) return false;
    await studyYear.destroy();
    return true;
  },
};

// --- ClassRoom CRUD ---
export const ClassRoomService = {
  create: async (data: WithSchoolAndYearId<ClassAttributes>) => {
    if (!data.yearId) {
      throw new Error("yearId is required to create a ClassRoom.");
    }
    return ClassRoom.create(data);
  },
  findAll: async (schoolId: string, yearId?: string) => {
    const whereClause: { schoolId: string; yearId?: string } = { schoolId };
    if (yearId) {
      whereClause.yearId = yearId;
    }
    return ClassRoom.findAll({
      where: whereClause,
      include: [Option, StudyYear, School],
    });
  },
  findById: async (schoolId: string, classId: string, yearId?: string) => {
    const whereClause: { classId: string; schoolId: string; yearId?: string } =
      { classId, schoolId };
    if (yearId) {
      whereClause.yearId = yearId;
    }
    return ClassRoom.findOne({
      where: whereClause,
      include: [Option, StudyYear, School],
    });
  },
  update: async (
    schoolId: string,
    classId: string,
    data: Partial<ClassAttributes>,
    yearId?: string
  ) => {
    const whereClause: { classId: string; schoolId: string; yearId?: string } =
      { classId, schoolId };
    if (yearId) {
      whereClause.yearId = yearId;
    }
    const classRoom = await ClassRoom.findOne({ where: whereClause });
    if (!classRoom) return null;
    return classRoom.update(data);
  },
  delete: async (schoolId: string, classId: string, yearId?: string) => {
    const whereClause: { classId: string; schoolId: string; yearId?: string } =
      { classId, schoolId };
    if (yearId) {
      whereClause.yearId = yearId;
    }
    const classRoom = await ClassRoom.findOne({ where: whereClause });
    if (!classRoom) return false;
    await classRoom.destroy();
    return true;
  },
};

// --- ClassroomEnrolement CRUD ---
export const ClassroomEnrolementService = {
  create: async (data: WithSchoolId<ClassroomEnrolementAttributes>) => {
    return ClassroomEnrolement.create(data);
  },
  findAll: async (schoolId: string, classroomId?: string) => {
    const whereClause: { schoolId: string; classroomId?: string } = {
      schoolId,
    };
    if (classroomId) {
      whereClause.classroomId = classroomId;
    }
    return ClassroomEnrolement.findAll({
      where: whereClause,
      include: [User, ClassRoom, School],
    });
  },
  findById: async (
    schoolId: string,
    enrolementId: string,
    classroomId?: string
  ) => {
    const whereClause: {
      enrolementId: string;
      schoolId: string;
      classroomId?: string;
    } = { enrolementId, schoolId };
    if (classroomId) {
      whereClause.classroomId = classroomId;
    }
    return ClassroomEnrolement.findOne({
      where: whereClause,
      include: [User, ClassRoom, School],
    });
  },
  update: async (
    schoolId: string,
    enrolementId: string,
    data: Partial<ClassroomEnrolementAttributes>,
    classroomId?: string
  ) => {
    const whereClause: {
      enrolementId: string;
      schoolId: string;
      classroomId?: string;
    } = { enrolementId, schoolId };
    if (classroomId) {
      whereClause.classroomId = classroomId;
    }
    const enrolement = await ClassroomEnrolement.findOne({
      where: whereClause,
    });
    if (!enrolement) return null;
    return enrolement.update(data);
  },
  delete: async (
    schoolId: string,
    enrolementId: string,
    classroomId?: string
  ) => {
    const whereClause: {
      enrolementId: string;
      schoolId: string;
      classroomId?: string;
    } = { enrolementId, schoolId };
    if (classroomId) {
      whereClause.classroomId = classroomId;
    }
    const enrolement = await ClassroomEnrolement.findOne({
      where: whereClause,
    });
    if (!enrolement) return false;
    await enrolement.destroy();
    return true;
  },
};
