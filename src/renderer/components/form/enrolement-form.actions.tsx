import { useCallback, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
    useCreateEnrolement,
    useCreateQuickEnrolement,
    useUpdateEnrollment,
    useDeleteEnrollment
} from "@/renderer/libs/queries/enrolement";
import { TQueryUpdate } from "@/renderer/libs/queries/type";
import type {
    TEnrolementCreate as EnrolementData,
    TEnrolementQuickCreate
} from "@/packages/@core/data-access/schema-validations";
import type { BaseFormProps } from "./base-form";

interface UseEnrolementConfig<T = EnrolementData> {
    mutationKeys?: unknown[];
    onSuccess?: (data?: T) => void;
}

/**
 * Hook interne pour la logique partagée (ID de formulaire et invalidation).
 */
function useEnrolementBase<T>(config?: UseEnrolementConfig<T>) {
    const formId = useId();
    const queryClient = useQueryClient();

    const notifyAndInvalidate = useCallback(
        (data: T) => {
            if (config?.mutationKeys) {
                queryClient.invalidateQueries({ queryKey: config.mutationKeys });
            }
            config?.onSuccess?.(data);
        },
        [queryClient, config]
    );

    return {
        formId,
        notifyAndInvalidate,
    };
}

/**
 * Hook pour la CRÉATION RAPIDE (Quick Enrollment)
 */
export function useCreateQuickEnrolementForm(config?: UseEnrolementConfig<TEnrolementQuickCreate>) {
    const { formId, notifyAndInvalidate } = useEnrolementBase(config);
    const mutation = useCreateQuickEnrolement();

    const createQuickEnrolement: BaseFormProps<TEnrolementQuickCreate>["onSubmit"] = useCallback(
        (data, helpers) => {
            const studentName = [data?.student?.firstName, data?.student?.lastName]
                .filter(Boolean)
                .join(" ");

            const successDescription = studentName
                ? `L'élève ${studentName} a été inscrit avec succès.`
                : "L'élève a été inscrit avec succès.";
            mutation.mutate(
                data,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Inscription réussie !",
                    successMessageDescription: successDescription,
                    errorMessageTitle: "Erreur d'inscription rapide.",
                    onSuccess: (res) => {
                        notifyAndInvalidate(res);
                        helpers?.reset?.();
                    },
                })
            );
        },
        [mutation, notifyAndInvalidate]
    );

    return { formId, onSubmit: createQuickEnrolement, isSubmitting: mutation.isPending };
}

/**
 * Hook pour la CRÉATION standard d'un enrôlement.
 */
export function useCreateEnrolementForm(config?: UseEnrolementConfig<EnrolementData>) {
    const { formId, notifyAndInvalidate } = useEnrolementBase(config);
    const mutation = useCreateEnrolement();

    const createEnrolement: BaseFormProps<EnrolementData>["onSubmit"] = useCallback(
        (data, helpers) => {
            mutation.mutate(
                data,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Enrôlement effectué",
                    successMessageDescription: "Le nouvel enrôlement a été enregistré.",
                    errorMessageTitle: "Échec de l'enrôlement.",
                    onSuccess: (res) => {
                        notifyAndInvalidate(res);
                        helpers?.reset?.();
                    },
                })
            );
        },
        [mutation, notifyAndInvalidate]
    );

    return { formId, onSubmit: createEnrolement, isSubmitting: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR d'un enrôlement.
 */
export function useUpdateEnrolementForm(config?: UseEnrolementConfig<EnrolementData>) {
    const { formId, notifyAndInvalidate } = useEnrolementBase(config);
    const mutation = useUpdateEnrollment();

    const updateEnrolement: BaseFormProps<TQueryUpdate<EnrolementData>>["onSubmit"] = useCallback(
        ({ data, id }, helpers) => {
            mutation.mutate(
                { data, id },
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Mise à jour réussie",
                    successMessageDescription: "Les informations de l'enrôlement ont été modifiées.",
                    errorMessageTitle: "Échec de la mise à jour.",
                    onSuccess: (res) => {
                        notifyAndInvalidate(res);
                        helpers?.reset?.();
                    },
                })
            );
        },
        [mutation, notifyAndInvalidate]
    );

    return { formId, onSubmit: updateEnrolement, isSubmitting: mutation.isPending };
}

/**
 * Hook pour la SUPPRESSION d'un enrôlement.
 */
export function useDeleteEnrolementForm(config?: UseEnrolementConfig<void>) {
    const queryClient = useQueryClient();
    const mutation = useDeleteEnrollment();

    const deleteEnrolement = useCallback(
        (enrolementId: string, studentName?: string) => {
            mutation.mutate(
                enrolementId,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Enrôlement annulé",
                    successMessageDescription: studentName
                        ? `L'enrôlement de ${studentName} a été supprimé.`
                        : "L'enrôlement a été supprimé.",
                    onSuccess: () => {
                        if (config?.mutationKeys) {
                            queryClient.invalidateQueries({ queryKey: config.mutationKeys });
                        }
                        config?.onSuccess?.();
                    }
                })
            );
        },
        [mutation, config, queryClient]
    );

    return { deleteEnrolement, isDeleting: mutation.isPending };
}