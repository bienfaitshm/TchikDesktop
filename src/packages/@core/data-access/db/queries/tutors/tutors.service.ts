import {
  SelectOptionFacade,
  type SelectOption,
} from "@/packages/drizzle-queries";
import {
  TutorRepository,
  type TutorDTO,
  type BaseTutorFilters,
} from "./tutors.repository";
import { BaseTutor } from "@/packages/@core/data-access/schema-validations";
import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import type { Tutor } from "@/packages/@core/data-access/db/schemas";
import { userRepository, UserRepository, UserDTO } from "../users";
import { formatTutorInput } from "./utils";

/**
 * Composite input type required to create a user account and an associated tutor profile.
 */
export type CreateTutorInput = BaseTutor;
export type UpdateTutorInput = BaseTutor;

/**
 * Custom error thrown when a requested entity is not found in the database.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

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
    private db: TDataBase,
    private readonly tutorRepository: TutorRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.tutorOptionFacade = new SelectOptionFacade<TutorDTO>(
      this.tutorRepository,
      {
        valueKey: "tutorId",
        labelKeyLong: "fullName",
        labelKeyShort: "firstName",
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
   * @returns The created tutor entity combined with its associated user details.
   */
  public createTutor(input: CreateTutorInput, tx?: TDataBase): TutorDTO {
    return (tx ?? this.db).transaction((tx: any) => {
      const { tutor: tutorPayload, user: userPayload } =
        formatTutorInput(input);

      const user = this.userRepository.createTutor(userPayload, tx);
      const tutor = this.tutorRepository.create(
        {
          ...tutorPayload,
          userId: user.userId,
        },
        tx,
      );

      return this.mapToTutorDTO(tutor, user);
    });
  }

  /**
   * Updates an existing tutor profile and associated user account within an atomic transaction.
   * @param tutorId - Unique identifier of the tutor to update.
   * @param payload - Payload containing updated tutor and user attributes.
   * @returns The updated tutor entity combined with its associated user details.
   * @throws NotFoundError If the tutor or associated user record is not found.
   */
  public updateTutor(
    tutorId: string,
    payload: UpdateTutorInput,
    tx?: TDataBase,
  ): TutorDTO {
    return (tx ?? this.db).transaction((tx: any) => {
      const { tutor: tutorPayload, user: userPayload } =
        formatTutorInput(payload);

      const tutor = this.tutorRepository.updateById(tutorId, tutorPayload, tx);
      if (!tutor) {
        throw new NotFoundError(`Tutor with ID "${tutorId}" was not found.`);
      }

      const user = this.userRepository.updateById(
        tutor.userId,
        userPayload,
        tx,
      );
      if (!user) {
        throw new NotFoundError(
          `User with ID "${tutor.userId}" linked to tutor "${tutorId}" was not found.`,
        );
      }

      return this.mapToTutorDTO(tutor, user);
    });
  }

  /**
   * Maps tutor and user database entities into a consolidated TutorDTO object.
   * @param tutor - The persisted tutor database entity.
   * @param user - The persisted user database entity.
   * @returns A clean, non-colliding TutorDTO instance.
   */
  private mapToTutorDTO(tutor: Tutor, user: UserDTO): TutorDTO {
    return {
      ...tutor,
      ...user,
    };
  }
}

export const tutorRepository = new TutorRepository();
export const tutorService = new TutorService(
  db,
  tutorRepository,
  userRepository,
);
