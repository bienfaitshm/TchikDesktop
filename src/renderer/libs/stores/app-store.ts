import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  SchoolAttributes,
  StudyYearAttributes,
} from "@/camons/types/models";

/**
 * @interface ApplicationConfigurationState
 * @description Defines the state properties managed by the application's global configuration store.
 * @property {SchoolAttributes | undefined} currentSchool - The currently selected educational institution.
 * This value is persisted across sessions. It is `undefined` if no school is selected.
 * @property {StudyYearAttributes | undefined} currentStudyYear - The currently selected academic or study year.
 * This value is also persisted across sessions. It is `undefined` if no year is selected.
 */
interface ApplicationConfigurationState {
  currentSchool?: SchoolAttributes;
  currentStudyYear?: StudyYearAttributes;
}

/**
 * @interface ApplicationConfigurationActions
 * @description Defines the actions available to modify the state within the application's configuration store.
 * @property {(school?: SchoolAttributes) => void} setCurrentSchool - Sets the currently active educational institution.
 * Passing `undefined` will clear the selection and remove it from persistent storage.
 * @property {(studyYear?: StudyYearAttributes) => void} setCurrentStudyYear - Sets the currently active academic or study year.
 * Passing `undefined` will clear the selection and remove it from persistent storage.
 */
interface ApplicationConfigurationActions {
  setCurrentSchool(school?: SchoolAttributes): void;
  setCurrentStudyYear(studyYear?: StudyYearAttributes): void;
}

/**
 * @typedef {ApplicationConfigurationState & ApplicationConfigurationActions} ApplicationConfigurationStore
 * @description Combines the state properties and their corresponding actions into a single
 * type representing the complete structure of the application's configuration store.
 */
type ApplicationConfigurationStore = ApplicationConfigurationState &
  ApplicationConfigurationActions;

/**
 * @constant useApplicationConfigurationStore
 * @description A central Zustand store for managing the global application configuration,
 * specifically the currently selected educational institution and academic/study year.
 * The state is automatically **persisted to and rehydrated from `localStorage`** using
 * Zustand's `persist` middleware, ensuring user selections are remembered across browser sessions.
 *
 * @example
 * ```typescript
 * import { useApplicationConfigurationStore } from './path/to/this/file';
 *
 * // Assuming dummy types for demonstration if actual types aren't available
 * type SchoolAttributes = { id: string; name: string; };
 * type StudyYearAttributes = { id: string; name: string; };
 *
 * function ConfigurationDisplay() {
 * // Access state and actions from the store
 * const { currentSchool, currentStudyYear, setCurrentSchool, setCurrentStudyYear } = useApplicationConfigurationStore();
 *
 * // Example data for demonstration
 * const exampleSchool = { id: 'uni-001', name: 'University of Knowledge' };
 * const exampleYear = { id: 'ay-2025', name: 'Academic Year 2025-2026' };
 *
 * return (
 * <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
 * <h2>Application Configuration</h2>
 * <p>
 * <strong>Current School:</strong>{' '}
 * {currentSchool ? currentSchool.name : 'No school selected'}
 * </p>
 * <p>
 * <strong>Current Study Year:</strong>{' '}
 * {currentStudyYear ? currentStudyYear.name : 'No year selected'}
 * </p>
 * <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
 * <button onClick={() => setCurrentSchool(exampleSchool)}>
 * Select Example School
 * </button>
 * <button onClick={() => setCurrentSchool(undefined)}>
 * Clear School Selection
 * </button>
 * <button onClick={() => setCurrentStudyYear(exampleYear)}>
 * Select Example Year
 * </button>
 * <button onClick={() => setCurrentStudyYear(undefined)}>
 * Clear Year Selection
 * </button>
 * </div>
 * <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
 * (Your selections are saved in local storage and will persist!)
 * </p>
 * </div>
 * );
 * }
 * ```
 */
export const useApplicationConfigurationStore =
  create<ApplicationConfigurationStore>()(
    persist(
      (set) => ({
        // --- Initial State ---
        currentSchool: undefined,
        currentStudyYear: undefined,

        // --- Actions ---
        /**
         * Sets the currently selected school in the store.
         * This action automatically persists the selected school to localStorage.
         * @param {SchoolAttributes | undefined} school - The school to set as current, or `undefined` to clear.
         */
        setCurrentSchool(school) {
          set({ currentSchool: school });
        },

        /**
         * Sets the currently selected study year in the store.
         * This action automatically persists the selected study year to localStorage.
         * @param {StudyYearAttributes | undefined} studyYear - The study year to set as current, or `undefined` to clear.
         */
        setCurrentStudyYear(studyYear) {
          set({ currentStudyYear: studyYear });
        },
      }),
      {
        // --- Persist Configuration ---
        // A unique name for your storage. This will be the key used in localStorage.
        name: "app-global-configuration",
        storage: createJSONStorage(() => localStorage),

        // Optional: partialize allows you to pick which parts of the state to persist.
        // If omitted, the entire state will be persisted. For this store,
        // all state properties (`currentSchool`, `currentStudyYear`) are relevant for persistence.
        // partialize: (state) => ({
        //   currentSchool: state.currentSchool,
        //   currentStudyYear: state.currentStudyYear,
        // }),

        // Optional: versioning for managing state shape changes over time.
        // When the state shape changes, increment the version and add a `migrate` function.
        version: 0, // Start with version 0
        // migrate: (persistedState: any, version: number) => {
        //   // Example migration from an older version
        //   if (version === 0) {
        //     // If your old state had different keys or structure, you'd transform it here.
        //     // e.g., if 'oldSchool' was renamed to 'currentSchool'
        //     // persistedState.currentSchool = persistedState.oldSchool;
        //     // delete persistedState.oldSchool;
        //   }
        //   return persistedState as ApplicationConfigurationStore;
        // },
      }
    )
  );
