import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  SchoolAttributes,
  StudyYearAttributes,
} from "@/camons/types/models";

// Définit l'état du store
interface ConfigurationState {
  currentSchool?: SchoolAttributes;
  currentStudyYear?: StudyYearAttributes;
}

// Définit les actions pour modifier l'état
interface ConfigurationActions {
  setCurrentSchool(school?: SchoolAttributes): void;
  setCurrentStudyYear(studyYear?: StudyYearAttributes): void;
  isSetCurrentSchool(): boolean;
  isSetCurrentStudyYear(): boolean;
  getCurrentStudyYearSchool():
    | { schoolId: string; yearId: string; isSet: true }
    | { schoolId: undefined; yearId: undefined; isSet: false };
}

// Combine l'état et les actions
type ConfigurationStore = ConfigurationState & ConfigurationActions;

// Crée le store Zustand, avec persistance dans le localStorage
export const useApplicationConfigurationStore = create<ConfigurationStore>()(
  persist(
    (set, get) => ({
      // État initial
      currentSchool: undefined,
      currentStudyYear: undefined,

      // Actions
      setCurrentSchool: (school) => set({ currentSchool: school }),
      setCurrentStudyYear: (studyYear) => set({ currentStudyYear: studyYear }),
      isSetCurrentSchool: () => !!get().currentSchool?.schoolId,
      isSetCurrentStudyYear: () => !!get().currentStudyYear?.yearId,

      getCurrentStudyYearSchool: () => {
        const { currentSchool, currentStudyYear } = get();
        if (currentSchool && currentStudyYear) {
          return {
            isSet: true,
            schoolId: currentSchool.schoolId,
            yearId: currentStudyYear.yearId,
          };
        }
        return { isSet: false, schoolId: undefined, yearId: undefined };
      },
    }),
    {
      name: "app-global-configuration",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Hook pour obtenir les IDs de l'école et de l'année d'étude
export const useGetCurrentYearSchool = () => {
  const { schoolId, yearId } = useApplicationConfigurationStore((s) => ({
    schoolId: s.currentSchool?.schoolId,
    yearId: s.currentStudyYear?.yearId,
  }));
  return { schoolId, yearId } as const;
};
