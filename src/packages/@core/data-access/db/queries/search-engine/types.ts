export type SearchEntityType = "STUDENT" | "TUTOR";

export interface SearchContext {
  schoolId: string;
  yearId: string; // Année académique en cours
}

export interface BaseSuggestion<T extends SearchEntityType, P> {
  id: string;
  type: T;
  title: string; // Nom complet
  subtitle: string; // Code élève ou numéro de téléphone
  avatarUrl?: string;
  preview: P;
}

// Aperçu ÉLÈVE
export interface StudentPreviewData {
  studentCode: string;
  enrollment: {
    enrollmentId: string;
    classroomName: string;
    status: string;
  } | null;
  tutor: {
    tutorId: string;
    fullName: string;
    phone: string | null;
    profession: string | null;
  } | null;
  financials: {
    totalAssigned: number;
    totalPaid: number;
    balance: number;
    status: "PAID" | "PARTIAL" | "UNPAID" | "NO_FEES";
  };
  seating: {
    roomName: string;
    row: number;
    column: number;
    sessionName: string;
  } | null;
  siblings: Array<{
    studentId: string;
    fullName: string;
    classroomName: string;
  }>;
}

// Aperçu TUTEUR / PARENT
export interface TutorPreviewData {
  tutorId: string;
  phoneNumber: string | null;
  profession: string | null;
  address: string | null;
  children: Array<{
    studentId: string;
    fullName: string;
    studentCode: string;
    classroomName: string;
    financialStatus: "PAID" | "PARTIAL" | "UNPAID";
  }>;
}

export type StudentSuggestion = BaseSuggestion<"STUDENT", StudentPreviewData>;
export type TutorSuggestion = BaseSuggestion<"TUTOR", TutorPreviewData>;
export type SearchSuggestion = StudentSuggestion | TutorSuggestion;

/**
 * Defines the contract for a bounded search strategy.
 * Implementations handle specific domain entities like students or tutors.
 */
export interface SearchStrategy {
  readonly entityType: SearchEntityType;
  /**
   * Executes a search query returning strongly-typed suggestions.
   * @param query - Raw search query string.
   * @param context - Organizational context boundary (school, year).
   * @param limit - Maximum number of results to return.
   * @returns Array of formatted search suggestions.
   */
  search(
    query: string,
    context: SearchContext,
    limit: number,
  ): Promise<SearchSuggestion[]>;
}
