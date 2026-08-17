import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchClassrooms } from "../classrooms";
import {
  useGenerateSeating,
  useRebuildAssignStudents,
  seatingKeys,
} from "./seating";
import { withNotifications } from "@/renderer/libs/notifications";
import type { BulkAssignParams } from "@/packages/@core/apis/clients";
import {
  type RoomState,
  formatRoomsToSeatingAssignments,
} from "@/renderer/libs/seating-viewer";
import type { SeatingGenerator } from "@/packages/@core/data-access/schema-validations";
import type { BaseFormProps } from "../base";
import { useSearchLocalRooms } from "./helper";

export interface SeatingGeneratorPayload extends SeatingGenerator {
  schoolId: string;
  yearId: string;
}

export interface SaveSeatingConfig {
  sessionName?: string;
  sessionId: string;
  schoolId: string;
  yearId: string;
  onSuccess?: (data?: unknown) => void;
}

export interface UseSeatingGeneratorManagerProps {
  sessionId: string;
  sessionName?: string;
  schoolId: string;
  yearId: string;
  onSuccess?(): void;
}

const GENERATE_NOTIFICATIONS = {
  success: {
    title: "Génération réussie",
    description: "Le plan de salle temporaire a été calculé avec succès.",
  },
  error: {
    title: "Échec de la génération",
    description:
      "Une erreur est survenue lors de la création de la simulation.",
  },
};

/**
 * Builds notification options for saving seating assignments.
 * @param sessionName - Optional name of the active seating session.
 * @returns Notification object configuration.
 */
const getSaveNotifications = (sessionName?: string) => ({
  success: {
    title: "Enregistrement réussi",
    description: sessionName
      ? `La mise en place '${sessionName}' a été enregistrée.`
      : "La mise en place a été enregistrée avec succès.",
  },
  error: {
    title: "Erreur d'enregistrement",
    description: "Impossible de sauvegarder la configuration sur le serveur.",
  },
});

/**
 * Manages local memory simulation state for seating plan calculations before backend persistence.
 * @returns State and actions for seating simulation management.
 */
export function useSeatingGenerator() {
  const [generatedRooms, setGeneratedRooms] = useState<RoomState[]>([]);
  const { mutateAsync: generateAsync, isPending: isGenerating } =
    useGenerateSeating();

  const clearSimulation = useCallback(() => setGeneratedRooms([]), []);

  const generateSeating = useCallback(
    async (data: SeatingGeneratorPayload) => {
      return generateAsync(
        data,
        withNotifications({
          notifications: GENERATE_NOTIFICATIONS,
          onSuccess: (res) => {
            setGeneratedRooms(res as RoomState[]);
          },
        }),
      );
    },
    [generateAsync],
  );

  return {
    generatedRooms,
    isGenerating,
    generateSeating,
    hasData: generatedRooms.length > 0,
    clearSimulation,
  };
}

/**
 * Fetches select/combobox options for classrooms and local rooms based on school and year context.
 * @param schoolId - Optional school identifier.
 * @param yearId - Optional academic year identifier.
 * @returns Object containing classroom and local room search query results.
 */
export function useRoomOptions(schoolId?: string, yearId?: string) {
  const classroomFilters = useMemo(
    () => ({ where: { yearId, schoolId } }),
    [schoolId, yearId],
  );

  const localRoomFilters = useMemo(() => ({ where: { schoolId } }), [schoolId]);

  const classRoomOptions = useSearchClassrooms({ filters: classroomFilters });
  const localRoomOptions = useSearchLocalRooms({ filters: localRoomFilters });

  return {
    classRoomOptions,
    localRoomOptions,
  };
}

/**
 * Persists calculated room seating assignments to the backend and triggers query cache invalidations.
 * @param config - Target session configuration and success callbacks.
 * @returns Function to save assignment and current pending state.
 */
export function useSaveSeatingAssignment(config: SaveSeatingConfig) {
  const queryClient = useQueryClient();
  const { mutate, isPending: isSaving } = useRebuildAssignStudents();

  const onSuccessRef = useRef(config.onSuccess);
  useEffect(() => {
    onSuccessRef.current = config.onSuccess;
  }, [config.onSuccess]);

  const saveAssignment = useCallback(
    (data: RoomState[], extraParams: BulkAssignParams) => {
      const seatingData = formatRoomsToSeatingAssignments(
        data,
        config.sessionId,
      );

      mutate(
        { data: seatingData, params: extraParams },
        withNotifications({
          notifications: getSaveNotifications(config.sessionName),
          onSuccess: (res) => {
            queryClient.invalidateQueries({
              queryKey: seatingKeys.sessionDetail(config.sessionId),
            });
            queryClient.invalidateQueries({
              queryKey: seatingKeys.sessionRoomsStatus(config.sessionId),
            });

            onSuccessRef.current?.(res);
          },
        }),
      );
    },
    [mutate, config.sessionId, config.sessionName, queryClient],
  );

  return {
    saveAssignment,
    isSaving,
  };
}

/**
 * High-level facade hook coordinating simulation, options retrieval, modal visibility, and batch saving.
 * @param props - Session configuration and completion callbacks.
 * @returns Unified state and event handlers for managing seating generation.
 */
export function useSeatingGeneratorManager({
  sessionId,
  sessionName,
  schoolId,
  yearId,
  onSuccess,
}: UseSeatingGeneratorManagerProps) {
  const formId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const {
    generateSeating,
    generatedRooms,
    hasData,
    isGenerating,
    clearSimulation,
  } = useSeatingGenerator();

  const { classRoomOptions, localRoomOptions } = useRoomOptions(
    schoolId,
    yearId,
  );

  const handleSaveSuccess = useCallback(() => {
    setIsOpen(false);
    clearSimulation();
    onSuccess?.();
  }, [clearSimulation, onSuccess]);

  const { isSaving, saveAssignment } = useSaveSeatingAssignment({
    sessionId,
    sessionName,
    schoolId,
    yearId,
    onSuccess: handleSaveSuccess,
  });

  const isBusy = isGenerating || isSaving;

  const handleFormSubmit: BaseFormProps<SeatingGenerator>["onSubmit"] =
    useCallback(
      (data) => {
        if (schoolId && yearId) {
          generateSeating({ ...data, schoolId, yearId });
        }
      },
      [schoolId, yearId, generateSeating],
    );

  const handleSave = useCallback(() => {
    if (!generatedRooms.length) return;
    saveAssignment(generatedRooms, { schoolId, sessionId, yearId });
  }, [generatedRooms, schoolId, sessionId, yearId, saveAssignment]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isBusy) return;
      setIsOpen(open);
    },
    [isBusy],
  );

  return {
    formId,
    isOpen,
    isBusy,
    isGenerating,
    isSaving,
    hasData,
    generatedRooms,
    classRoomOptions,
    localRoomOptions,
    setIsOpen: handleOpenChange,
    handleFormSubmit,
    handleSave,
  };
}

/**
 * Utility hook providing a memoized function to invalidate seating-related query caches.
 * @param params - Target sessionId and optional localRoomId filters.
 * @returns Memoized function that triggers cache invalidation on execution.
 */
export function useInvalidateSeatingCache({
  sessionId,
  localRoomId,
}: {
  sessionId: string;
  localRoomId?: string;
}) {
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (!sessionId) return;

    queryClient.invalidateQueries({
      queryKey: seatingKeys.sessionDetail(sessionId),
    });
    queryClient.invalidateQueries({
      queryKey: seatingKeys.sessionRoomsStatus(sessionId),
    });

    if (localRoomId) {
      queryClient.invalidateQueries({
        queryKey: seatingKeys.sessionRoomLayout(sessionId, localRoomId),
      });
    }
  }, [queryClient, sessionId, localRoomId]);
}
