import * as React from "react";
import { Suspense } from "@/renderer/libs/queries/suspense";
import {
  Dialog,
  DialogClose,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/dialog/base";
import { TutorProfileCard } from "@/renderer/apps/schools/components/tutor-profile";
import type { TutorDTO } from "@/packages/@core/data-access/db";
import { useGetEnrollments } from "@/renderer/libs/queries/enrollements";
import { Button } from "@/renderer/components/ui/button";

/**
 * Properties for the TutorProfileContent component.
 */
export interface TutorProfileContentProps {
  /** Detailed tutor payload to render inside the container. */
  tutor?: TutorDTO;
  /** Active academic year identifier. */
  yearId?: string;
  /** Active school identifier. */
  schoolId?: string;
}

/**
 * Renders tutor profile details and associated student enrollments within a dialog container.
 * @param props - Component props containing optional tutor data and scope identifiers.
 * @returns Rendered dialog container or a fallback placeholder.
 */
export const TutorProfileContent: React.FC<TutorProfileContentProps> = ({
  tutor,
  schoolId,
  yearId,
}) => {
  const tutorId = tutor?.tutorId;

  const { data: enrollments = [] } = useGetEnrollments({
    where: {
      classroomEnrollments: { tutorId, schoolId, yearId },
    },
  });

  if (!tutor) {
    return (
      <DialogContainer>
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-sm text-slate-400">
          Aucune information tuteur disponible.
        </div>
      </DialogContainer>
    );
  }

  return (
    <DialogContainer>
      <TutorProfileCard tutor={tutor} enrollments={enrollments} />
    </DialogContainer>
  );
};

TutorProfileContent.displayName = "TutorProfileContent";

/**
 * Properties for the TutorProfileDialog component.
 */
export interface TutorProfileDialogProps {
  /** Detailed tutor payload to be displayed in the modal. */
  tutor?: TutorDTO;
  /** Controls the open state of the dialog. */
  open?: boolean;
  /** Callback executed when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Optional custom trigger element that toggles the dialog. */
  trigger?: React.ReactNode;
  /** Active academic year identifier. */
  yearId?: string;
  /** Active school identifier. */
  schoolId?: string;
}

/**
 * Renders a full modal dialog displaying tutor profile details and linked student records.
 * @param props - Configuration properties controlling visibility, triggers, and payload data.
 * @returns Rendered modal dialog element.
 */
export const TutorProfileDialog: React.FC<TutorProfileDialogProps> = ({
  tutor,
  open,
  onOpenChange,
  trigger,
  schoolId,
  yearId,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Détails du profil du tuteur</DialogTitle>
          <DialogDescription>
            Informations d'identité, coordonnées et liste des élèves associés.
          </DialogDescription>
        </DialogHeader>
        <Suspense>
          <TutorProfileContent
            tutor={tutor}
            schoolId={schoolId}
            yearId={yearId}
          />
        </Suspense>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

TutorProfileDialog.displayName = "TutorProfileDialog";
