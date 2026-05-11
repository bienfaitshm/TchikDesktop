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
import ButtonGenerator from "@/renderer/components/buttons/button-generator";
import { SeatingGeneratorForm } from "@/renderer/components/form/seating-generator-form";
import { Button } from "@/renderer/components/ui/button";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { SeatingGeneratorContent } from "./content";
import { Loader2 } from "lucide-react";
import {
  useSeatingGeneratorManager,
  type UseSeatingGeneratorManagerProps,
} from "./hooks";

interface SeatingGeneratorDialogProps {}

export const SeatingGeneratorDialog = (
  props: SeatingGeneratorDialogProps & UseSeatingGeneratorManagerProps,
) => {
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

  return (
    <Dialog modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ButtonGenerator isLoading={isGenerating} hasGenerated={hasData} />
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[95vw] lg:max-w-[85vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => isBusy && e.preventDefault()}
        onEscapeKeyDown={(e) => isBusy && e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-card">
          <DialogTitle className="text-2xl tracking-tight">
            Générer la mise en place
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Configuration de la répartition pour la session :
            <span className="ml-1 font-semibold text-primary">
              {props.sessionName}
            </span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 w-full bg-slate-50 dark:bg-background">
          <div className="p-6 space-y-8 mx-auto">
            <section className="p-5">
              <h3 className="text-lg font-medium mb-4 text-foreground/80">
                1. Paramètres de génération
              </h3>
              <SeatingGeneratorForm
                formId={formId}
                classRoomOptions={classRoomOptions}
                localRoomOptions={localRoomOptions}
                onSubmit={handleFormSubmit}
              />
            </section>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-dashed border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 dark:bg-background px-4 text-muted-foreground font-semibold tracking-wider">
                  2. Visualisation du placement
                </span>
              </div>
            </div>
            <section className="min-h-[400px]">
              {isGenerating ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground font-medium">
                    Création de la répartition en cours...
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Cela peut prendre quelques instants.
                  </p>
                </div>
              ) : hasData ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SeatingGeneratorContent
                    hasGenerate={hasData}
                    rooms={generatedRooms}
                  />
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-center p-6">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <span className="text-3xl">🪑</span>
                  </div>
                  <h4 className="text-lg font-medium text-foreground mb-1">
                    Aucune mise en place générée
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Remplissez les paramètres ci-dessus et cliquez sur "Générer"
                    pour visualiser la répartition des salles.
                  </p>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t bg-card flex flex-row items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isBusy} className="px-6">
              Annuler
            </Button>
          </DialogClose>
          <div className="flex items-center gap-3">
            <ButtonGenerator
              form={formId}
              type="submit"
              isLoading={isGenerating}
              hasGenerated={hasData}
              disabled={isSaving}
              className="min-w-[180px] transition-all"
            />

            {hasData && (
              <ButtonLoader
                onClick={handleSave}
                isLoading={isSaving}
                variant="default"
                isLoadingText="Sauvegarde en cours..."
                className="min-w-[180px] shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all animate-in zoom-in-95 duration-200"
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
