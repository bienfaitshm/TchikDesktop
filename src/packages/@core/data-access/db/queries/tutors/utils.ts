import {
  InsertTutor,
  InsertUser,
} from "@/packages/@core/data-access/db/schemas";
import { BaseTutor } from "@/packages/@core/data-access/schema-validations";

/**
 * Represents the formatted payload ready for database insertion,
 * separating user account details from tutor profile data.
 */
export type FormattedTutorPayload = {
  tutor: Omit<InsertTutor, "tutorId">;
  user: Omit<InsertUser, "password">;
};

/**
 * Transforms a raw base tutor input object into structured payload entities for user and tutor persistence.
 * @param input - The raw tutor input data conforming to BaseTutor.
 * @returns The formatted payload containing separate user and tutor objects.
 * @throws Error if mandatory attributes such as birthDate are missing.
 */
export function formatTutorInput(input: BaseTutor): FormattedTutorPayload {
  if (!input.birthDate) {
    input.birthDate = undefined;
  }

  const {
    address,
    phoneNumber,
    profession,
    schoolId,
    birthDate,
    ...userAttributes
  } = input;

  return {
    user: {
      ...userAttributes,
      birthDate,
      schoolId,
    },
    tutor: {
      schoolId,
      address,
      phoneNumber,
      profession,
    },
  };
}
