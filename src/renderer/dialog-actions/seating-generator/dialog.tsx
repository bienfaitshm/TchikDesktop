"use client";
import { Sparkles } from "lucide-react";

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

import ButtonGenerator from "@/renderer/components/buttons/button-generator";
import { SeatingGeneratorForm } from "@/renderer/components/form/seating-generator-form";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { SeatingDisplayContent } from "./content";

import { cn } from "@/renderer/utils";
import {
  useSeatingGeneratorManager,
  type UseSeatingGeneratorManagerProps,
} from "./hooks";

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
    <Dialog modal={false} open={isOpen} onOpenChange={setIsOpen}>
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

        <ScrollArea className="flex-1 bg-slate-50/50 dark:bg-background/50">
          <div className="mx-auto p-8 space-y-12">
            <section
              className={cn(
                "bg-background rounded-xl border p-6 shadow-xs transition-opacity",
                isBusy && "opacity-50 pointer-events-none",
              )}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  1
                </span>
                <h3 className="font-semibold">Paramètres de configuration</h3>
              </div>

              <SeatingGeneratorForm
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

            <section className="min-h-[400px]">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SeatingDisplayContent
                  hasAssignments={props.hasAssignments!}
                  isGenerating={isGenerating}
                  hasData={hasData}
                  generatedRooms={generatedRooms}
                />
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="px-8 py-4 border-t bg-background space-x-10">
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
              className="min-w-[160px]"
            />

            {hasData && (
              <ButtonLoader
                onClick={handleSave}
                isLoading={isSaving}
                variant="default"
                isLoadingText="Enregistrement..."
                className="min-w-[180px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Confirmer l'attribution
              </ButtonLoader>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

SeatingGeneratorDialog.displayName = "SeatingGeneratorDialog";
