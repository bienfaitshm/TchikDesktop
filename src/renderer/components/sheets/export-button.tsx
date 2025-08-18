import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/renderer/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/renderer/components/ui/tabs";
import { useExportStudentEnrollementDocument, useExportTestSheet, useExportSheetDataToJson } from "@/renderer/libs/queries/document-export";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { FileText, FileSpreadsheet } from "lucide-react";
import { ButtonLoader } from "../form/button-loader";

/**
 * Composant pour le bouton d'exportation de données.
 * Il affiche une feuille de dialogue pour permettre à l'utilisateur de choisir
 * le format d'exportation (document ou Excel).
 */
export const ButtonDataExport = () => {
    const mutate = useExportSheetDataToJson()
    const handleExport = () => {
        mutate.mutate({}, createMutationCallbacksWithNotifications({}))
    }
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <FileText className="size-4" />
                    <span>Exporter</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Options d'exportation</SheetTitle>
                    <SheetDescription>
                        Choisissez le format de fichier que vous souhaitez exporter.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="document" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="document">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4" />
                                <span>Document</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="excel">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="size-4" />
                                <span>Feuille de calcul</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="document" className="mt-4">
                        <div className="flex flex-col gap-4">
                            <p>
                                L'exportation en format document permet de générer des fiches
                                d'information.
                            </p>
                            <div className="grid gap-3">
                                <Label htmlFor="document-export-filename">Nom du fichier</Label>
                                <Input
                                    id="document-export-filename"
                                    placeholder="Ex: Fiches_Eleves_2025"
                                />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="excel" className="mt-4">
                        <div className="flex flex-col gap-4">
                            <p>
                                L'exportation en format Excel génère un tableau de données
                                exploitable.
                            </p>
                            <div className="grid gap-3">
                                <Label htmlFor="excel-export-filename">Nom du fichier</Label>
                                <Input
                                    id="excel-export-filename"
                                    placeholder="Ex: Données_Eleves_2025"
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">
                            Fermer
                        </Button>
                    </SheetClose>
                    <ButtonLoader isLoading={mutate.isPending} type="submit" onClick={handleExport}>Exporter</ButtonLoader>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};