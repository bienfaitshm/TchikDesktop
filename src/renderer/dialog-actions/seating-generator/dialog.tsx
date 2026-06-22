"use client";
import React from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Button } from "@/renderer/components/ui/button";
import { Separator } from "@/renderer/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/renderer/components/ui/tooltip";

import ButtonGenerator from "@/renderer/components/buttons/button-generator";
import { SeatingGeneratorForm } from "@/renderer/components/form/seating-generator-form";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { SeatingDisplayContent } from "./content";

import { cn } from "@/renderer/utils";
import {
  useSeatingGeneratorManager,
  useHideFormConfig,
  type UseSeatingGeneratorManagerProps,
} from "./hooks";

interface EyeToggleProps {
  onToggle?: () => void;
  isClosed?: boolean;
}

export const EyeToggle = ({ isClosed = false, onToggle }: EyeToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onToggle}
          aria-label={
            isClosed ? "Ouvrir la configuration" : "Fermer la configuration"
          }
        >
          {isClosed ? <EyeOff /> : <Eye />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isClosed
          ? "Ouvrir le formulaire de configuration"
          : "Fermer le formulaire de configuration"}
      </TooltipContent>
    </Tooltip>
  );
};

const FormConfig: React.FC<
  React.ComponentProps<typeof SeatingGeneratorForm>
> = (props) => {
  const { isClosed, toggle } = useHideFormConfig();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center size-6 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            1
          </span>
          <h3 className="font-semibold">Paramètres de configuration</h3>
        </div>
        <EyeToggle isClosed={isClosed} onToggle={toggle} />
      </div>
      <AnimatePresence initial={false}>
        {!isClosed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: "easeIn" },
                opacity: { duration: 0.1 },
              },
            }}
            className="overflow-hidden"
          >
            <SeatingGeneratorForm {...props} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SeatingGeneratorDialogProps extends UseSeatingGeneratorManagerProps {
  hasAssignments?: boolean;
}

export const SeatingGeneratorDialog = (props: SeatingGeneratorDialogProps) => {
  const {
    formId,
    isOpen,
    isBusy,
    isGenerating,
    isSaving,
    hasData,
    generatedRooms,
    classRoomOptions,
    localRoomOptions,
    setIsOpen,
    handleFormSubmit,
    handleSave,
  } = useSeatingGeneratorManager(props);

  const showContent = hasData || props.hasAssignments;

  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ButtonGenerator isLoading={isGenerating} hasGenerated={showContent} />
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[95vw] lg:max-w-[85vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl"
        onPointerDownOutside={(e) => isBusy && e.preventDefault()}
        onEscapeKeyDown={(e) => isBusy && e.preventDefault()}
      >
        <DialogHeader className="px-8 pt-6 pb-4 border-b bg-background shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Générateur de mise en place
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5 font-semibold text-foreground uppercase">
                {props.sessionName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 h-[70%] bg-slate-50/50 dark:bg-background/50">
          <div className="mx-auto px-8 py-4 space-y-6">
            <section
              className={cn(
                "bg-background rounded-xl border py-2 px-4 shadow-xs transition-opacity",
                isBusy && "opacity-50 pointer-events-none",
              )}
            >
              <FormConfig
                formId={formId}
                classRoomOptions={classRoomOptions}
                localRoomOptions={localRoomOptions}
                onSubmit={handleFormSubmit}
              />
            </section>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="border-dashed" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 dark:bg-background px-4 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">
                  Aperçu de la répartition
                </span>
              </div>
            </div>

            <section className="min-h-100">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SeatingDisplayContent
                  hasAssignments={props.hasAssignments!}
                  isGenerating={isGenerating}
                  hasData={hasData}
                  generatedRooms={generatedRooms}
                  classroomOptions={classRoomOptions}
                />
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="px-10 pb-10 gap-5 sm:gap-4">
          <DialogClose asChild>
            <Button
              variant="ghost"
              disabled={isBusy}
              className="text-xs uppercase font-bold tracking-widest px-6"
            >
              Annuler
            </Button>
          </DialogClose>

          <div className="flex items-center gap-3">
            <ButtonGenerator
              form={formId}
              type="submit"
              isLoading={isGenerating}
              hasGenerated={showContent}
              disabled={isSaving}
              className="min-w-40"
            />

            {hasData && (
              <LoadingButton
                onClick={handleSave}
                loading={isSaving}
                variant="default"
                loadingText="Enregistrement..."
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Confirmer l'attribution
              </LoadingButton>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

SeatingGeneratorDialog.displayName = "SeatingGeneratorDialog";
