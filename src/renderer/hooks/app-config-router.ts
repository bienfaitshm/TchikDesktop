import { useOutletContext } from "react-router";

interface SchoolContext {
  schoolId: string;
  yearId: string;
}

/**
 * Hook pour consommer les IDs scolaires de manière sécurisée.
 * À utiliser dans n'importe quelle page enfant du SchoolContextLayout.
 */
export const useSchoolContext = () => {
  const context = useOutletContext<SchoolContext>();

  if (!context) {
    throw new Error(
      "useSchoolContext doit être utilisé à l'intérieur de SchoolContextLayout",
    );
  }

  return context;
};
