import { useCallback, useMemo, useState, useRef, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import {
  useGenerateSeating,
  useGetLocalRooms,
  useRebuildAssignStudents,
  seatingKeys,
} from "@/renderer/libs/queries/seating";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import type { BulkAssignParams } from "@/packages/@core/apis/clients";
import {
  type RoomState,
  formatRoomsToSeatingAssignments,
} from "@/renderer/libs/seating-viewer";
import type { SeatingGenerator } from "@/packages/@core/data-access/schema-validations";
import { useParams } from "react-router";

type SeatingGeneratorPayload = {
  localRoomIds: string[];
  classRoomIds: string[];
  confortRatio: number;
  schoolId: string;
  yearId: string;
};
/**
 * Hook pour générer un plan de salle
 */
export function useSeatingGenerator() {
  const [generatedRooms, setGeneratedRooms] = useState<RoomState[]>([]);
  const { mutateAsync: generateAsync, isPending: isGenerating } =
    useGenerateSeating();

  const generateSeating = useCallback(
    async (data: SeatingGeneratorPayload) => {
      return generateAsync(
        data,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Génération réussie",
          successMessageDescription:
            "Le plan de salle a été généré avec succès.",
          errorMessageTitle: "Échec de la génération",
          errorMessageDescription:
            "Une erreur est survenue lors de la création du plan.",
          onSuccess: (data) => {
            setGeneratedRooms(data as RoomState[]);
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
  };
}

/**
 * Hook pour récupérer les options de sélection des salles
 */
export const useRoomOptions = (schoolId?: string, yearId?: string) => {
  const { data: classRooms = [] } = useGetClassrooms(
    { where: { schoolId, yearId } },
    // { enabled: !!schoolId && !!yearId }
  );

  const { data: localRooms = [] } = useGetLocalRooms(
    { where: { schoolId } },
    // { enabled: !!schoolId }
  );

  return useMemo(
    () => ({
      classRoomOptions: classRooms.map((c) => ({
        label: c.shortIdentifier,
        value: c.classId,
      })),
      localRoomOptions: localRooms.map((l) => ({
        label: l.name,
        value: l.localroomId,
      })),
    }),
    [classRooms, localRooms],
  );
};

type SaveSeatingConfig = {
  sessionName?: string;
  sessionId: string;
  onSuccess?: (data?: unknown) => void;
};

/**
 * Hook pour sauvegarder l'assignation des places
 */
export const useSaveSeatingAssignment = (config: SaveSeatingConfig) => {
  const { mutate, isPending: isSaving } = useRebuildAssignStudents();
  const onSuccessRef = useRef(config?.onSuccess);
  onSuccessRef.current = config?.onSuccess;

  const saveAssignment = useCallback(
    (data: RoomState[], extraParams: BulkAssignParams) => {
      const seatingData = formatRoomsToSeatingAssignments(
        data,
        config.sessionId,
      );
      mutate(
        { data: seatingData, params: extraParams },
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Enregistrement réussi",
          successMessageDescription: config?.sessionName
            ? `La mise en place '${config.sessionName}' a été enregistrée.`
            : "La mise en place a été enregistrée avec succès.",
          errorMessageTitle: "Erreur d'enregistrement",
          errorMessageDescription:
            "Impossible de sauvegarder la configuration.",
          onSuccess: (res) => onSuccessRef.current?.(res),
        }),
      );
    },
    [mutate, config?.sessionName],
  );

  return {
    saveAssignment,
    isSaving,
  };
};

export interface UseSeatingGeneratorManagerProps {
  sessionId: string;
  sessionName?: string;
  schoolId: string;
  yearId: string;
  onSuccess?(): void;
}

export const useSeatingGeneratorManager = ({
  sessionId,
  sessionName,
  schoolId,
  yearId,
  onSuccess,
}: UseSeatingGeneratorManagerProps) => {
  const formId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const { generateSeating, generatedRooms, hasData, isGenerating } =
    useSeatingGenerator();
  const { classRoomOptions, localRoomOptions } = useRoomOptions(
    schoolId,
    yearId,
  );

  const { isSaving, saveAssignment } = useSaveSeatingAssignment({
    sessionId,
    sessionName,
    onSuccess: () => {
      setIsOpen(false);
      onSuccess?.();
    },
  });

  const isBusy = isGenerating || isSaving;

  const handleFormSubmit = useCallback(
    (data: SeatingGenerator) => {
      if (schoolId && yearId) {
        generateSeating?.({ ...data, schoolId, yearId });
      }
    },
    [schoolId, yearId, generateSeating],
  );

  const handleSave = useCallback(() => {
    if (!generatedRooms) return;
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
    // États
    formId,
    isOpen,
    isBusy,
    isGenerating,
    isSaving,
    hasData,
    generatedRooms,
    // Options pour les sélecteurs
    classRoomOptions,
    localRoomOptions,
    // Actions
    setIsOpen: handleOpenChange,
    handleFormSubmit,
    handleSave,
  };
};

/**
 * @description Hook  pour invalider le cache des salles
 */
export const useInvalidateSeatingCache = () => {
  const { sessionId, localRoomId } = useParams<{
    sessionId: string;
    localRoomId?: string;
  }>();

  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
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

  return invalidate;
};
