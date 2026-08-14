import * as React from "react";
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

/**
 * Props interface for the TutorProfileContent component.
 */
export interface TutorProfileContentProps {
  /** Detailed tutor payload to render inside the container. */
  tutor?: TutorDTO;
}

/**
 * Renders tutor profile details safely inside a dialog container wrapper.
 * @param props - Component props containing the optional tutor data.
 * @returns Rendered dialog container or an empty fallback state.
 */
export const TutorProfileContent: React.FC<TutorProfileContentProps> = ({
  tutor,
}) => {
  if (!tutor) {
    return (
      <DialogContainer>
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-sm text-slate-400">
          No tutor information available.
        </div>
      </DialogContainer>
    );
  }

  return (
    <DialogContainer>
      <TutorProfileCard tutor={tutor} />
    </DialogContainer>
  );
};

TutorProfileContent.displayName = "TutorProfileContent";

/**
 * Props interface for the TutorProfileDialog component.
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
}

/**
 * Renders a full modal dialog displaying tutor profile information.
 * @param props - Configuration properties controlling visibility and payload data.
 * @returns Rendered modal dialog element.
 */
export const TutorProfileDialog: React.FC<TutorProfileDialogProps> = ({
  tutor,
  open,
  onOpenChange,
  trigger,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tutor Profile Details</DialogTitle>
          <DialogDescription>
            Comprehensive identity, contact information, and linked student
            records.
          </DialogDescription>
        </DialogHeader>

        <TutorProfileContent tutor={tutor} />

        <DialogFooter>
          <DialogClose className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white">
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

TutorProfileDialog.displayName = "TutorProfileDialog";
