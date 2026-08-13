import {
  SelectOptionFacade,
  type SelectOption,
} from "@/packages/drizzle-queries";
import {
  TutorRepository,
  type TutorDTO,
  type BaseTutorFilters,
} from "./tutors.repository";
import {
  InsertTutor,
  InsertUser,
} from "@/packages/@core/data-access/db/schemas";
import { db } from "@/packages/@core/data-access/db/config";
import { USER_ROLE_ENUM } from "@/packages/@core/data-access/db/options";
import { userRepository, UserRepository } from "../users";

/**
 * Composite input type required to create a user account and an associated tutor profile.
 */
export type CreateTutorInput = Omit<InsertUser, "password"> & InsertTutor;

/**
 * Service handling business logic, user creation, and option formatting for tutors.
 */
export class TutorService {
  public readonly tutorOptionFacade: SelectOptionFacade<TutorDTO>;

  /**
   * Initializes the tutor service with repositories and sets up option mapping rules.
   * @param tutorRepository - Repository for managing tutor data operations.
   * @param userRepository - Repository for managing user data operations.
   */
  constructor(
    private readonly tutorRepository: TutorRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.tutorOptionFacade = new SelectOptionFacade<TutorDTO>(
      this.tutorRepository,
      {
        valueKey: "tutorId",
        labelKeyLong: "user.fullName",
        labelKeyShort: "user.firstName",
        labelFormat: "long",
        transform: (option, item): SelectOption => {
          const phone = item.phoneNumber?.trim() || "N/A";
          const address = item.address?.trim() || "N/A";

          return {
            ...option,
            description: `Tél. : ${phone} | Adresse : ${address}`,
          };
        },
      },
    );
  }

  /**
   * Fetches formatted selection options for tutor dropdown inputs.
   * @param args - Filter criteria for querying tutors.
   * @returns A promise resolving to an array of selection options.
   */
  public async getOptions(args: BaseTutorFilters): Promise<SelectOption[]> {
    return this.tutorOptionFacade.loadOptions(args);
  }

  /**
   * Creates a user account and a tutor profile within an atomic database transaction.
   * @param input - Payload containing user and tutor creation details.
   * @returns created tutor with user details populated.
   */
  public createTutor(input: CreateTutorInput): TutorDTO {
    return db.transaction((tx) => {
      const user = this.userRepository.createUser(
        {
          lastName: input.lastName,
          middleName: input.middleName,
          firstName: input.firstName,
          schoolId: input.schoolId,
          gender: input.gender,
          role: USER_ROLE_ENUM.TUTOR,
        },
        tx,
      );

      const tutor = this.tutorRepository.create(
        {
          schoolId: input.schoolId,
          address: input.address,
          phoneNumber: input.phoneNumber,
          profession: input.profession,
          userId: user.userId,
        },
        tx,
      );

      return {
        ...tutor,
        user,
      };
    });
  }
}

export const tutorRepository = new TutorRepository();
export const tutorService = new TutorService(tutorRepository, userRepository);
