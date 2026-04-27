import { useId } from "react";
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog";
import { FileText, Loader } from "lucide-react";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { DocumentFormData, useExport } from "@/renderer/hooks/documents";
import { DynamicForm, FormFieldDef } from "@/packages/dynamic-form"
import { Input } from "@/renderer/components/ui/input"

import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/renderer/components/ui/select";
import { useGetAvailableExports } from "@/renderer/libs/queries/document-export";
import React from "react";
import { DocumentMetadata } from "@/packages/electron-data-exporter";


type WithSchoolAndYearId<T> = T & { schoolId: string, yearId?: string }



const userProfileSchema: FormFieldDef[] = [
    {
        id: "firstName",
        type: "text",
        label: "Prénom",
        placeholder: "ex: Jean",
        required: true,
        colSpan: 6, // Prend la moitié de la ligne sur 12 colonnes
        defaultValue: ""
    },
    {
        id: "lastName",
        type: "text",
        label: "Nom",
        placeholder: "ex: Dupont",
        required: true,
        colSpan: 6, // Prend l'autre moitié
        defaultValue: ""
    },
    {
        id: "userEmail",
        type: "email",
        label: "Adresse Email",
        placeholder: "jean.dupont@tech.com",
        required: true,
        colSpan: 12, // Pleine largeur
        customClass: "bg-slate-50" // Exemple de style personnalisé
    },
    {
        id: "department",
        type: "select",
        label: "Département",
        required: true,
        colSpan: 8,
        defaultValue: "eng", // Valeur par défaut pré-sélectionnée
        options: [
            { label: "Engineering", value: "eng" },
            { label: "Design", value: "dsgn" },
            { label: "Product", value: "prod" },
            { label: "Marketing", value: "mkt" }
        ]
    },
    {
        id: "experienceYears",
        type: "number",
        label: "Années d'expérience",
        required: false,
        colSpan: 4,
        defaultValue: 0
    }
];

type SelectComponentFieldProps = {
    placeholder?: string;
    options?: { value: string, label: string }[];
    onChangeValue?(value: string): void;
    value?: string;
}
const SelectComponentField: React.FC<SelectComponentFieldProps> = ({ onChangeValue, value, options = [], placeholder }) => {
    return (
        <Select value={value} onValueChange={onChangeValue}>
            <SelectTrigger aria-label={placeholder}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

const components: {
    TextField: React.ComponentType<any>;
    SelectField?: React.ComponentType<any>;
} = {
    TextField: Input,
    SelectField: (field) => <SelectComponentField {...field} />
}
interface LoaderIndicatorProps {
    message?: string;
}

export const LoaderIndicator: React.FC<LoaderIndicatorProps> = ({ message = "Exportation en cours..." }) => {
    return (
        <div className="flex flex-col items-center p-2 space-y-1 rounded-lg border bg-background text-center">
            <Loader className="h-4 w-4 animate-spin" />
            <div>
                <h3 className="text-sm font-semibold">
                    {message}
                </h3>
                <p className="text-xs text-muted-foreground ">
                    Veuillez patienter pendant le traitement de votre demande.
                </p>
            </div>
        </div>
    );
};

const SheetFormContent: React.FC<{ onSubmit(data: DocumentFormData<any>): void, formId: string }> = ({ onSubmit, formId }) => {
    const [documentType, setDocumentType] = React.useState<null | DocumentMetadata<any>>(null)
    const { data: availableDocuments } = useGetAvailableExports()
    const options = React.useMemo(() => availableDocuments?.map((item) => ({ label: item.title, value: item.key })), [availableDocuments])
    const onChangeValue = React.useCallback((value: string) => {
        const newValue = availableDocuments?.filter(item => item.key === value)
        setDocumentType(newValue)
    }, [availableDocuments])
    return (
        <div>
            <label>
                Choisi les types de document a exporter
            </label>
            <SelectComponentField value={documentType?.key} onChangeValue={onChangeValue} options={options} />
            <DynamicForm
                formId={formId}
                onSubmit={(data) => onSubmit({ documentType: documentType?.key, data })}
                fields={userProfileSchema}
                components={components}
            />
        </div>
    )
}

export const SheetDataExport: React.FC<WithSchoolAndYearId<{ currentClassroom?: string }>> = () => {
    const formId = useId()
    const [isPending, onSubmit] = useExport()
    return (
        <Sheet modal={false}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <FileText className="size-4" />
                    <span>Exporter</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Options d'exportation</SheetTitle>
                    <SheetDescription>
                        Choisissez le format de fichier que vous souhaitez exporter.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-5 mb-10">
                    <SheetFormContent formId={formId} onSubmit={onSubmit} />
                </div>
                {isPending && <LoaderIndicator message="Exportation..." />}
                <SheetFooter className="pt-5">
                    <SheetClose asChild>
                        <Button
                            className="text-sm"
                            size="sm"
                            type="button"
                            variant="secondary"
                            disabled={isPending}
                        >
                            Fermer
                        </Button>
                    </SheetClose>
                    <ButtonLoader
                        form={formId}
                        type="submit"
                        className="text-sm"
                        size="sm"
                        disabled={isPending}
                    >
                        Exporter
                    </ButtonLoader>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};


export const ButtonDataExport = withSchoolConfig(SheetDataExport)