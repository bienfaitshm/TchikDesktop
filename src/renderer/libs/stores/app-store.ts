"use client";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  TSchoolAttributes as TSchool,
  TStudyYearAttributes as TStudyYear,
} from "@/packages/@core/data-access/schema-validations";
import { useEffect, useState } from "react";

const APP_STORE_NAME = "app-global-configuration";

// Définit l'état du store
interface ConfigurationState {
  currentSchool?: TSchool;
  currentStudyYear?: TStudyYear;
}

// Définit les actions pour modifier l'état
interface ConfigurationActions {
  setCurrentSchool(school?: TSchool): void;
  setCurrentStudyYear(studyYear?: TStudyYear): void;
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
      name: APP_STORE_NAME,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * Interface normalisée pour la consommation UI
 */
export interface CurrentSchoolConfig {
  schoolId: string | undefined;
  yearId: string | undefined;
  isConfigured: boolean;
}

/**
 * Hook optimisé pour récupérer la configuration scolaire actuelle.
 * * Pourquoi useShallow ici ?
 * Parce que sans lui, Zustand verrait un nouvel objet {schoolId, yearId}
 * à chaque changement d'une autre propriété du store (ex: si tu ajoutes
 * plus tard un champ 'theme' dans ce même store).
 */
export const useGetCurrentYearSchool = (): CurrentSchoolConfig => {
  return useApplicationConfigurationStore(
    useShallow((s) => ({
      schoolId: s.currentSchool?.schoolId,
      yearId: s.currentStudyYear?.yearId,
      isConfigured: !!(s.currentSchool?.schoolId && s.currentStudyYear?.yearId),
    })),
  );
};

// Ajoute ce petit helper dans ton fichier store ou hooks
export const useIsStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
};
