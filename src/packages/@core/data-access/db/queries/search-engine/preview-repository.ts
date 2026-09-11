import type { TDataBase } from "../../config";
import { helpers } from "@/packages/drizzle-queries";
import {
  users,
  type User,
  type FeeAssignment,
  type FeeType,
  type FeeSchedule,
  type ClassroomEnrollment,
  type Classroom,
  type Tutor,
  type StudyYear,
  type SeatingSession,
  type SeatingAssignment,
  type Localroom,
} from "../../schemas";

/**
 * Context parameters required to scope student preview queries.
 */
export type StudentPreviewContext = {
  yearId?: string;
  schoolId: string;
};

/**
 * Enrollment shape for sibling students attached to the same tutor.
 */
type TutorStudentEnrollment = ClassroomEnrollment & {
  classroom: Classroom;
  student: User;
};

/**
 * Detailed student enrollment entity with related fees, seatings, and tutor info.
 */
type StudentEnrollment = ClassroomEnrollment & {
  classroom: Classroom;
  year: StudyYear;
  feeAssignments: (FeeAssignment & {
    schedule: FeeSchedule & { feeType: FeeType };
  })[];
  seatingAssignments: (SeatingAssignment & {
    session: SeatingSession;
    localroom: Localroom;
  })[];
  tutor:
    | (Tutor & {
        enrollments: TutorStudentEnrollment[];
      })
    | null;
};

/**
 * Composite shape of the raw student preview query result.
 */
export type StudentPreviewResult = Pick<User, "userId"> & {
  enrollments: StudentEnrollment[];
};

/**
 * Structured preview data for a student, separating current and historical enrollments.
 */
export type Preview = {
  subTitle: string;
  currentEnrollment: StudentEnrollment | null;
  enrollments: StudentEnrollment[];
};

/**
 * Repository dedicated to fetching and mapping student preview details.
 */
export class StudentPreviewRepository {
  /**
   * Initializes the repository with database instance and execution context.
   * @param db - The database client instance.
   * @param ctx - The scoping context containing tenant and optional academic year details.
   */
  constructor(
    private readonly db: TDataBase,
    private readonly ctx: StudentPreviewContext,
  ) {}

  /**
   * Maps student raw preview data into a Map keyed by user ID with formatted details.
   * @param userIds - Array of student user IDs to process.
   * @returns A promise resolving to a Map of student user IDs to their Preview object.
   */
  public async mapPreview(userIds: string[]): Promise<Map<string, Preview>> {
    const students = await this.getPreview(userIds);

    return new Map<string, Preview>(
      students.map((student) => {
        const currentEnrollment =
          student.enrollments.find((enr) => enr.yearId === this.ctx.yearId) ??
          null;

        const subTitle = currentEnrollment
          ? `${currentEnrollment.classroom.shortIdentifier} • Code: ${currentEnrollment.studentCode}`
          : "Non réinscrit pour l'année scolaire en cours";

        const historicalEnrollments = student.enrollments.filter(
          (enr) => enr.yearId !== this.ctx.yearId,
        );

        const previewResult: Preview = {
          subTitle,
          currentEnrollment,
          enrollments: historicalEnrollments,
        };

        return [student.userId, previewResult];
      }),
    );
  }

  /**
   * Fetches detailed preview information for a given set of user IDs.
   * Filters out the target student from their tutor's sibling enrollment list.
   * @param userIds - Array of student user IDs to query.
   * @returns A promise resolving to an array of student preview objects.
   */
  public async getPreview(userIds: string[]): Promise<StudentPreviewResult[]> {
    if (!userIds.length) return [];

    const rawResults = (await this.db.query.users.findMany({
      ...helpers.extractQueryPayload(
        { users },
        {
          where: {
            users: {
              schoolId: this.ctx.schoolId,
              userId: { $in: userIds },
            },
          },
        },
      ),
      columns: { userId: true },
      with: {
        enrollments: {
          with: {
            classroom: true,
            year: true,
            feeAssignments: {
              with: {
                schedule: {
                  with: {
                    feeType: true,
                  },
                },
              },
            },
            seatingAssignments: {
              with: {
                localroom: true,
                session: true,
              },
            },
            tutor: {
              with: {
                enrollments: {
                  with: {
                    classroom: true,
                    student: true,
                  },
                },
              },
            },
          },
        },
      },
    })) as StudentPreviewResult[];

    return rawResults.map((student) => ({
      ...student,
      enrollments: student.enrollments.map((enrollment) => {
        if (!enrollment.tutor) return enrollment;

        return {
          ...enrollment,
          tutor: {
            ...enrollment.tutor,
            enrollments: enrollment.tutor.enrollments.filter(
              (tutorEnrollment) =>
                tutorEnrollment.studentId !== student.userId &&
                tutorEnrollment.student?.userId !== student.userId,
            ),
          },
        };
      }),
    }));
  }
}
