import { Button } from "@/renderer/components/ui/button";
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
import { FileText, FileSpreadsheet } from "lucide-react";
import { DocumentExportList, documentExports } from "@/renderer/components/documents/document";
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";
import { WithSchoolAndYearId } from "@/commons/types/services";


export const SheetDataExport: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {

    return (
        <Sheet modal={false}>
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
                        <DocumentExportList schoolId={schoolId} yearId={yearId} documents={documentExports} />
                    </TabsContent>
                    <TabsContent value="excel" className="mt-4">
                        <DocumentExportList schoolId={schoolId} yearId={yearId} documents={documentExports} />
                    </TabsContent>
                </Tabs>
                <SheetFooter className="pt-5">
                    <SheetClose asChild>
                        <Button className="text-sm" size="sm" type="button" variant="secondary">
                            Fermer
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};


export const ButtonDataExport = withCurrentConfig(SheetDataExport)