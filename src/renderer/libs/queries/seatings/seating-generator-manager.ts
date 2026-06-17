import { useCallback, useMemo, useState, useRef, useId } from "react";
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

/**
 * 1. Hook pour générer un plan de placement (Simulé en mémoire locale avant persistence)
 */
export function useSeatingGenerator() {
  const [generatedRooms, setGeneratedRooms] = useState<RoomState[]>([]);
  const { mutateAsync: generateAsync, isPending: isGenerating } =
    useGenerateSeating();

  const generateSeating = useCallback(
    async (data: SeatingGeneratorPayload) => {
      return generateAsync(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Génération réussie",
              description:
                "Le plan de salle temporaire a été calculé avec succès.",
            },
            error: {
              title: "Échec de la génération",
              description:
                "Une erreur est survenue lors de la création de la simulation.",
            },
          },
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
    clearSimulation: () => setGeneratedRooms([]),
  };
}

/**
 * 2. Hook pour récupérer les options destinées aux composants Select/Combobox
 */
export function useRoomOptions(schoolId?: string, yearId?: string) {
  const classRoomOptions = useSearchClassrooms({
    filters: { where: { yearId, schoolId } },
  });
  const localRoomOptions = useSearchLocalRooms({
    filters: { where: { schoolId } },
  });

  return useMemo(
    () => ({
      classRoomOptions,
      localRoomOptions,
    }),
    [classRoomOptions, localRoomOptions],
  );
}

/**
 * 3. Hook pour sauvegarder définitivement l'assignation des places et synchroniser le cache
 */
export function useSaveSeatingAssignment(config: SaveSeatingConfig) {
  const queryClient = useQueryClient();
  const { mutate, isPending: isSaving } = useRebuildAssignStudents();

  const onSuccessRef = useRef(config.onSuccess);
  onSuccessRef.current = config.onSuccess;

  const saveAssignment = useCallback(
    (data: RoomState[], extraParams: BulkAssignParams) => {
      const seatingData = formatRoomsToSeatingAssignments(
        data,
        config.sessionId,
      );

      mutate(
        { data: seatingData, params: extraParams },
        withNotifications({
          notifications: {
            success: {
              title: "Enregistrement réussi",
              description: config.sessionName
                ? `La mise en place '${config.sessionName}' a été enregistrée.`
                : "La mise en place a été enregistrée avec succès.",
            },
            error: {
              title: "Erreur d'enregistrement",
              description:
                "Impossible de sauvegarder la configuration sur le serveur.",
            },
          },
          onSuccess: (res) => {
            // Pipeline senior : Invalidation chirurgicale automatique à l'enregistrement
            queryClient.invalidateQueries({
              queryKey: seatingKeys.sessionDetail(config.sessionId),
            });
            queryClient.invalidateQueries({
              queryKey: seatingKeys.sessionRoomsStatus(config.sessionId),
            });

            // Notification du callback d'UI
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
 * 4. Hook Complet : useSeatingGeneratorManager (Façade Pattern principal)
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

  const { isSaving, saveAssignment } = useSaveSeatingAssignment({
    sessionId,
    sessionName,
    schoolId,
    yearId,
    onSuccess: () => {
      setIsOpen(false);
      clearSimulation(); // Nettoyage de la mémoire de simulation au succès
      onSuccess?.();
    },
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
 * 5. Hook utilitaire indépendant d'invalidation (Utile pour le Drag & Drop unitaire hors manager)
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
