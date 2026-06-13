import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import {
  EnrollmentForm,
  type EnrollmentFormData,
} from "@/renderer/components/form";
import {
  ConfirmDeleteDialog,
  useConfirm,
} from "@/renderer/components/dialog/dialog-delete";
import {
  useGetClassroomAsOptions,
  useGetUsersAsOptions,
} from "@/renderer/hooks/data-as-options";

import {
  useUpdateEnrollmentForm,
  useDeleteEnrollmentForm,
  useCreateQuickEnrollmentForm,
} from "@/renderer/form-actions/enrollments";

import { USER_ROLE_ENUM as ROLE } from "@/packages/@core/data-access/db/enum";
import { BaseFormConfig } from "./base.dialog-actions";

type SchoolYearId = { schoolId: string; yearId: string };

type CreateEnrollmentDialogProps = {
  children: React.ReactNode;
  defaultValues?: Partial<EnrollmentFormData>;
};

type UpdateEnrollmentDialogProps = {
  children: React.ReactNode;
  enrollmentId: string;
  initialData?: Partial<EnrollmentFormData>;
  fullName?: string;
};

interface DeleteEnrollmentDialogProps {
  children: (props: {
    onOpen: () => void;
    isLoading: boolean;
  }) => React.ReactNode;
  enrollmentId: string;
  studentName: string;
}

/**
 * Dialogue : Inscription Complète (Create)
 */
export const CreateEnrollmentDialog: React.FC<
  CreateEnrollmentDialogProps & SchoolYearId & BaseFormConfig
> = ({ children, defaultValues, schoolId, yearId, ...config }) => {
  const { formId, onSubmit, isSubmitting } =
    useCreateQuickEnrollmentForm(config);
  const classrooms = useGetClassroomAsOptions({ where: { schoolId, yearId } });
  const students = useGetUsersAsOptions(
    { where: { schoolId, role: ROLE.STUDENT } },
    { labelFormat: "long" },
  );
  return (
    <Dialog modal>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px] md:max-w-[900px] lg:max-w-[1000px] p-8"
        onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
        onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Dossier d'Inscription</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire complet pour procéder à l'enrôlement de
            l'élève.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <EnrollmentForm
            formId={formId}
            onSubmit={onSubmit}
            initialValues={defaultValues}
            classrooms={classrooms}
            students={students}
          />
        </div>

        <DialogFooter className="bg-transparent gap-4">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isSubmitting}>
              Annuler
            </Button>
          </DialogClose>
          <ButtonLoader
            form={formId}
            type="submit"
            isLoading={isSubmitting}
            aria-label="Soumettre le dossier d'inscription"
          >
            Valider l'inscription
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialogue : Modification (Update)
 */
export const UpdateEnrollmentDialog: React.FC<
  UpdateEnrollmentDialogProps & SchoolYearId & BaseFormConfig
> = ({
  initialData,
  enrollmentId,
  children,
  schoolId,
  yearId,
  fullName,
  ...config
}) => {
  const { formId, isSubmitting, onSubmit } = useUpdateEnrollmentForm(config);
  const students = useGetUsersAsOptions(
    { where: { schoolId, role: ROLE.STUDENT } },
    { labelFormat: "long" },
  );
  const classrooms = useGetClassroomAsOptions({ where: { schoolId, yearId } });

  return (
    <Dialog modal>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]"
        onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
        onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            Modifier l'Inscription {fullName && `de ${fullName}`}
          </DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de l'élève pour l'année scolaire en
            cours.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <EnrollmentForm
            type="update"
            formId={formId}
            onSubmit={(data, helpers) =>
              onSubmit({ id: enrollmentId, data }, helpers)
            }
            initialValues={initialData}
            students={students}
            classrooms={classrooms}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isSubmitting}>
              Annuler
            </Button>
          </DialogClose>
          <ButtonLoader
            form={formId}
            type="submit"
            isLoading={isSubmitting}
            aria-label="Enregistrer les modifications de l'inscription"
          >
            Mettre à jour
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialogue : Suppression (Delete)
 */
export const DeleteEnrollmentDialog: React.FC<
  DeleteEnrollmentDialogProps & BaseFormConfig
> = ({ children, enrollmentId, studentName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();
  const { deleteEnrolement, isDeleting } = useDeleteEnrollmentForm({
    ...config,
    onSuccess: (data) => {
      config?.onSuccess?.(data);
      onClose();
    },
  });

  const handleConfirm = React.useCallback(async () => {
    await deleteEnrolement(enrollmentId, studentName);
  }, [enrollmentId, studentName, deleteEnrolement]);

  return (
    <>
      <ConfirmDeleteDialog
        item={enrollmentId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isLoading={isDeleting}
        title="Supprimer l'inscription"
        description="Attention : Cette action est irréversible. L'élève sera désinscrit et ses données d'enrôlement supprimées."
        itemName={studentName}
      />

      {children({
        onOpen: () => onOpen(enrollmentId),
        isLoading: isDeleting,
      })}
    </>
  );
};

DeleteEnrollmentDialog.displayName = "DeleteEnrollmentDialog";
