import { ClassRoom, ClassroomEnrolement, User } from "@/main/db/models";
import { Sequelize, Op, WhereOptions } from "sequelize";
import type {
  TClassroom,
  TWithUser,
  TEnrolement,
} from "@/commons/types/models";
import type { DocumentFilter } from "@/commons/types/services";
import { getDefinedAttributes } from "@/main/db/models/utils";

// Définition du type d'entrée/sortie
export type ClassesWithStudents = TClassroom & {
  ClassroomEnrolements: TWithUser<TEnrolement>[];
};
/**
 * filter
 * schoolId; yearId ;section or all; list of schools;
 * @param schoolId
 * @returns
 */

export type EnrollmentData = TClassroom & {
  ClassroomEnrolements: TWithUser<TEnrolement>[];
};

export async function getEnrollmentSchoolData({
  schoolId,
  yearId,
  sections,
  classrooms,
}: DocumentFilter) {
  const whereClause: any = getDefinedAttributes({ schoolId, yearId });

  if (sections && sections.length > 0) {
    whereClause.section = {
      [Op.in]: Array.isArray(sections) ? sections : [sections],
    };
  }
  if (classrooms && classrooms.length > 0) {
    whereClause.classId = {
      [Op.in]: Array.isArray(classrooms) ? classrooms : [classrooms],
    };
  }
  return ClassRoom.findAll({
    where: whereClause,
    include: [
      {
        model: ClassroomEnrolement,
        include: [User],
      },
    ],
    order: [
      [Sequelize.fn("LOWER", Sequelize.col("identifier")), "ASC"],
      [Sequelize.fn("LOWER", Sequelize.col("shortIdentifier")), "ASC"],
    ],
  });
}

/**
 * Récupère la liste des classes avec leurs élèves inscrits pour une école et une année données.
 * Les classes sont triées par identifiant (ordre alphabétique).
 * Les élèves au sein de chaque classe sont triés par nom de famille (ordre alphabétique).
 *
 * @param schoolId L'identifiant de l'école.
 * @param yearId L'identifiant de l'année scolaire.
 * @returns Une promesse résolue avec un tableau de type EnrollmentData.
 */
export async function getClassesWithStudents(filter: DocumentFilter) {
  // Construction dynamique de la clause WHERE
  const whereClause: WhereOptions = {
    schoolId: filter.schoolId,
  };

  // 1. FILTRAGE PAR ANNÉE SCOLAIRE (yearId est optionnel dans WithSchoolAndYearId)
  if (filter.yearId) {
    whereClause.yearId = filter.yearId;
  }

  // 2. FILTRAGE PAR SECTION(S)
  if (filter.sections) {
    // Si 'sections' est un tableau, on utilise l'opérateur 'in'
    if (Array.isArray(filter.sections)) {
      whereClause.section = { [Op.in]: filter.sections };
    }
    // Si c'est une seule SECTION, on utilise l'égalité
    else {
      whereClause.section = filter.sections;
    }
  }

  // 3. FILTRAGE PAR CLASSE(S) (classrooms)
  if (filter.classrooms) {
    // Le filtre 'classrooms' cible les IDs de classe (classId)
    // On suppose que 'classrooms' contient des IDs de classe (string[] ou string)
    if (Array.isArray(filter.classrooms)) {
      whereClause.classId = { [Op.in]: filter.classrooms };
    } else {
      whereClause.classId = filter.classrooms;
    }
  }
  try {
    const classes = await ClassRoom.findAll({
      // 1. FILTRAGE
      where: whereClause,
      // 2. INCLUSION DES ÉLÈVES INSCRITS
      include: [
        {
          model: ClassroomEnrolement,
          as: "ClassroomEnrolements", // Nom de l'association ClassRoom.hasMany(ClassroomEnrolement)
          required: false, // Inclut les classes même si elles n'ont pas d'élèves
          // 3. INCLUSION DES INFORMATIONS UTILISATEUR (ÉLÈVE)
          include: [
            {
              model: User,
              as: "User", // Nom de l'association ClassroomEnrolement.belongsTo(User)
              attributes: { exclude: ["password", "schoolId"] }, // Exclut les champs sensibles/redondants
              // 4. TRI DES ÉLÈVES PAR NOM DE FAMILLE (last_name)
              // order: [
              //   [Sequelize.fn("LOWER", Sequelize.col("lastName")), "ASC"],
              //   [Sequelize.fn("LOWER", Sequelize.col("middleName")), "ASC"],
              // ],
            },
          ],
          order: [
            [Sequelize.literal('LOWER("User"."last_name")'), "ASC"],
            [Sequelize.literal('LOWER("User"."middle_name")'), "ASC"],
            [Sequelize.literal('LOWER("User"."first_name")'), "ASC"],
          ],
        },
      ],
      // 5. TRI DES CLASSES PAR IDENTIFIANT (identifier)
      order: [
        ["identifier", "ASC"], // Tri principal des classes
      ],
      // 6. RESSORTIR LES DONNÉES EN FORMAT LISIBLE
      raw: false,
      nest: true,
    });

    // Le résultat est déjà au format attendu (EnrollmentData) grâce à l'inclusion et au typage.
    return classes;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des classes et des élèves:",
      error
    );
    throw new Error("Impossible de récupérer les données d'inscription.");
  }
}

/**
 * Trie les élèves (ClassroomEnrolements) d'une classe par leur nom complet (fullname)
 * par ordre alphabétique (ASC).
 *
 * @param classData L'objet de données de la classe avec la liste des élèves.
 * @returns Le même objet de données, mais avec les élèves triés.
 */
export function sortStudentsByFullName(
  classDatas: ClassesWithStudents[]
): ClassesWithStudents[] {
  // 1. Récupération de la liste des inscriptions
  return classDatas.map((classData) => {
    const enrolements = classData.ClassroomEnrolements;
    // console.log(
    //   "TYPE==========================",
    //   JSON.stringify(enrolements, null, 4)
    // );
    // 2. Tri du tableau d'inscriptions
    classData.ClassroomEnrolements.sort((a, b) => {
      // Les objets TWithUser<TEnrolement> contiennent l'objet User.
      const nameA = a.User.fullname || ""; // Utilise le fullname de l'utilisateur A (ou chaîne vide si absent)
      const nameB = b.User.fullname || ""; // Utilise le fullname de l'utilisateur B (ou chaîne vide si absent)

      // Comparaison locale pour un tri alphabétique correct (ASC)
      return nameA.localeCompare(nameB);
    });

    // 3. Le tableau 'enrolements' étant un pointeur vers classData.ClassroomEnrolements,
    // le tri modifie directement l'objet d'entrée.
    return classData;
  });
}
