import {
  ClassRoom,
  ClassroomEnrolement,
  Option,
  User,
  sequelize,
} from "@/main/db/models";
import { getDefinedAttributes } from "@/main/db/models/utils";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { SECTION, USER_GENDER } from "@/commons/constants/enum";

/**
 * Compte le nombre total d'élèves inscrits dans une école.
 * Si un 'yearId' est fourni, le décompte est limité à l'année scolaire spécifiée.
 * @param {object} params - Paramètres de la requête.
 * @param {string} params.schoolId - L'identifiant de l'école.
 * @param {string} [params.yearId] - (Optionnel) L'identifiant de l'année scolaire pour filtrer les résultats.
 * @returns {Promise<number>} Le nombre total d'inscriptions.
 */
export async function getTotalStudentsInSchool({
  schoolId,
  yearId,
}: WithSchoolAndYearId) {
  const whereClause = getDefinedAttributes({ schoolId });
  return ClassroomEnrolement.findOne({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          sequelize.col("ClassroomEnrolement.enrolement_id")
        ),
        "studentCount",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.FEMALE}' THEN 1 END`
          )
        ),
        "femaleCount",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.MALE}' THEN 1 END`
          )
        ),
        "maleCount",
      ],
    ],
    where: whereClause,
    include: [
      {
        model: ClassRoom,
        attributes: [],
        required: true,
        where: getDefinedAttributes({ yearId }),
      },
      {
        model: User,
        attributes: [],
        required: true,
      },
    ],
    raw: true,
  });
}

/**
 * Récupère le nombre total d'élèves par section pour une école.
 * @param {object} params - Paramètres de la requête.
 * @param {string} params.schoolId - L'identifiant de l'école.
 * @param {string} [params.yearId] - (Optionnel) L'identifiant de l'année scolaire.
 * @returns {Promise<Array<object>>} Un tableau d'objets, chacun contenant le nom de la section et le nombre d'élèves.
 */
export async function getStudentsBySection({
  schoolId,
  yearId,
}: WithSchoolAndYearId) {
  const whereClause = getDefinedAttributes({ schoolId });
  const results = await ClassroomEnrolement.findAll({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          sequelize.col("ClassroomEnrolement.enrolement_id")
        ),
        "studentCount",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.FEMALE}' THEN 1 END`
          )
        ),
        "femaleCount",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.MALE}' THEN 1 END`
          )
        ),
        "maleCount",
      ],
      [sequelize.col("ClassRoom.section"), "section"],
    ],
    include: [
      {
        model: ClassRoom,
        attributes: [],
        required: true,
        where: getDefinedAttributes({ yearId }),
      },
      {
        model: User,
        attributes: [],
        required: true,
      },
    ],
    where: whereClause,
    group: ["ClassRoom.section"],
    raw: true,
  });

  return results;
}

/**
 * Récupère le nombre de garçons et de filles pour chaque classe.
 * @param {object} params - Paramètres de la requête.
 * @param {string} params.schoolId - L'identifiant de l'école.
 * @param {string} [params.yearId] - (Optionnel) L'identifiant de l'année scolaire.
 * @returns {Promise<Array<object>>} Un tableau d'objets avec les identifiants de classe, le nombre de filles et de garçons.
 */
export async function getGenderCountByClassAndSection(
  params: WithSchoolAndYearId
) {
  const whereClause = getDefinedAttributes(params);
  const results = await ClassRoom.findAll({
    attributes: [
      "classId",
      "identifier",
      "shortIdentifier",
      [
        sequelize.literal(
          `SUM(CASE WHEN "ClassroomEnrolements->User"."gender" = '${USER_GENDER.FEMALE}' THEN 1 ELSE 0 END)`
        ),
        "femaleCount",
      ],
      [
        sequelize.literal(
          `SUM(CASE WHEN "ClassroomEnrolements->User"."gender" = '${USER_GENDER.MALE}' THEN 1 ELSE 0 END)`
        ),
        "maleCount",
      ],
    ],
    include: [
      {
        model: ClassroomEnrolement,
        attributes: [],
        required: false,
        include: [
          {
            model: User,
            attributes: [],
            required: false,
            as: "User",
          },
        ],
      },
    ],
    where: whereClause,
    group: ["classId"],
  });

  return results;
}

/**
 * Récupère le nombre d'élèves par option pour la section secondaire.
 * @param {object} params - Paramètres de la requête.
 * @param {string} params.schoolId - L'identifiant de l'école.
 * @param {string} [params.yearId] - (Optionnel) L'identifiant de l'année scolaire.
 * @returns {Promise<Array<object>>} Un tableau d'objets avec le nom de l'option et le nombre d'élèves.
 */
export async function getStudentsByOptionForSecondary({
  schoolId,
  yearId,
}: WithSchoolAndYearId) {
  const whereClause = getDefinedAttributes({ schoolId });
  const results = await ClassroomEnrolement.findAll({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          sequelize.col("ClassroomEnrolement.enrolement_id")
        ),
        "studentCount",
      ],
      [sequelize.col("ClassRoom.Option.option_name"), "optionName"],
      [sequelize.col("ClassRoom.Option.option_short_name"), "optionShortName"],
    ],
    include: [
      {
        model: ClassRoom,
        attributes: [],
        required: true,
        where: getDefinedAttributes({ yearId, section: SECTION.SECONDARY }),
        include: [
          {
            model: Option,
            attributes: [],
            required: true,
          },
        ],
      },
    ],
    where: whereClause,
    group: ["ClassRoom.Option.option_name"],
    raw: true,
  });

  return results;
}

/**
 * Compte le nombre de filles et de garçons inscrits dans une classe spécifique.
 * @param {string} classId - L'identifiant de la classe.
 * @returns {Promise<object>} Un objet contenant les nombres de filles et de garçons.
 */
export async function getGenderCountForClass(classId: string) {
  const result = await ClassroomEnrolement.findOne({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.FEMALE}' THEN 1 END`
          )
        ),
        "femaleCount",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.MALE}' THEN 1 END`
          )
        ),
        "maleCount",
      ],
    ],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
      },
    ],
    where: { classroomId: classId },
    raw: true,
  });
  return result;
}

/**
 * Compte le nombre de filles et de garçons pour chaque statut d'inscription dans une classe.
 * @param {string} classId - L'identifiant de la classe.
 * @returns {Promise<Array<object>>} Un tableau d'objets avec le statut, le nombre de filles et de garçons.
 */
export async function getGenderAndStatusCountForClass(classId: string) {
  const results = await ClassroomEnrolement.findAll({
    attributes: [
      "status",
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.FEMALE}' THEN 1 END`
          )
        ),
        "femaleCount",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal(
            `CASE WHEN User.gender = '${USER_GENDER.MALE}' THEN 1 END`
          )
        ),
        "maleCount",
      ],
    ],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
      },
    ],
    where: { classroomId: classId },
    group: ["ClassroomEnrolement.status"],
    raw: true,
  });
  return results;
}
