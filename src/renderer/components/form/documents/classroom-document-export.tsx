import { forwardRef, useMemo, useState, type PropsWithChildren } from "react";
import { useControlledForm } from "@/commons/libs/forms";
import { SECTION, SECTION_TRANSLATIONS, STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS } from "@/commons/constants/enum";
import { type DocumentExportSchemaAttributes, DocumentExportSchema } from "@/renderer/libs/schemas";
import { getEnumKeyValueList } from "@/commons/utils";
import { Check, ChevronDown } from "lucide-react";

// Components from Shadcn/ui
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/renderer/components/ui/form";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/renderer/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/renderer/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";


import { useFormImperativeHandle, type ImperativeFormHandle } from "../utils";
import { FilterCheckboxInput } from "../fields/filter-checkbox-input";
import { cn } from "@/renderer/utils";
import type { GroupedDocumentOption } from "@/commons/types/services.documents";


export type DocumentFormData = DocumentExportSchemaAttributes;


const DEFAULT_VALUES: DocumentFormData = {
    schoolId: "",
    yearId: "",
    documentType: "",
    classrooms: [],
    status: [STUDENT_STATUS.EN_COURS],
    sections: [SECTION.SECONDARY, SECTION.PRIMARY, SECTION.KINDERGARTEN],
};


const SECTIONS_OPTIONS = getEnumKeyValueList(SECTION, SECTION_TRANSLATIONS);
const STATUS_OPTIONS = getEnumKeyValueList(STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS);



type DocumentTypeComboBoxProps = {
    options: GroupedDocumentOption[];
    value: string;
    onChangeValue: (value: string) => void;
};

/**
 * ComboBox pour sélectionner un type de document avec des options groupées.
 */
export const DocumentTypeComboBox: React.FC<DocumentTypeComboBoxProps> = ({
    onChangeValue,
    value,
    options,
}) => {
    const [isOpen, setIsOpen] = useState(false);


    const selectedDocument = useMemo(() => {
        return options.flatMap(item => item.data).find(i => i.value === value);
    }, [value, options]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between h-auto py-2 px-4 text-left"
                >
                    {selectedDocument ? (
                        <div className="flex flex-col items-start space-y-1">
                            {/* Le titre est centré et mis en évidence */}
                            <span className="font-semibold text-sm">{selectedDocument.label.title}</span>
                            {/* La description est en texte plus petit et grisé */}
                            <span className="text-xs font-normal text-muted-foreground text-wrap">
                                {selectedDocument.label.subTitle}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Sélectionner un document...</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[26rem] p-0" side="right" align="start">
                <Command>
                    <CommandInput placeholder="Rechercher un document..." />
                    <CommandList>
                        <CommandEmpty>Aucun document trouvé.</CommandEmpty>
                        {options.map(({ section, data: documents }) => (
                            <CommandGroup key={section} heading={section}>
                                {documents.map((doc) => (
                                    <CommandItem
                                        key={doc.value}
                                        // La valeur de recherche est maintenant le titre et le sous-titre combinés
                                        value={`${doc.label.title} ${doc.label.subTitle}`}
                                        onSelect={() => {
                                            onChangeValue(doc.value);
                                            setIsOpen(false);
                                        }}
                                        className="gap-2" // Ajout d'un petit espacement
                                    >
                                        <div className="flex flex-col w-full">
                                            <p className="font-medium text-sm">{doc.label.title}</p>
                                            <p className="text-xs text-muted-foreground text-wrap">{doc.label.subTitle}</p>
                                        </div>
                                        <Check
                                            className={cn(
                                                'ml-auto h-4 w-4',
                                                value === doc.value ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


export interface DocumentEnrollmentFormProps {
    onSubmit?: (value: DocumentFormData) => void;
    initialValues?: Partial<DocumentFormData>;
    classrooms?: { label: string; value: string }[];
    documentOptions?: GroupedDocumentOption[];
}


export type DocumentEnrollmentFormHandle = ImperativeFormHandle<DocumentFormData>;

/**
 * Formulaire de configuration pour l'exportation de documents.
 */
export const DocumentEnrollmentForm = forwardRef<
    DocumentEnrollmentFormHandle,
    PropsWithChildren<DocumentEnrollmentFormProps>
>(({ children, onSubmit, initialValues = {}, classrooms = [], documentOptions = [] }, ref) => {

    const [form, handleSubmit] = useControlledForm({
        schema: DocumentExportSchema,
        defaultValues: { ...DEFAULT_VALUES, ...initialValues },
        onSubmit,
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mx-1 space-y-6">
                    <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                            <FormItem>
                                <div>
                                    <FormLabel>Type de document à exporter</FormLabel>
                                    <FormDescription>
                                        Choisissez le type de document pour l'exportation (ex: Liste des élèves, Bulletins).
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <DocumentTypeComboBox
                                        options={documentOptions}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sections"
                        render={({ field }) => (
                            <FormItem>
                                <div>
                                    <FormLabel>Sections</FormLabel>
                                    <FormDescription>
                                        Cochez les sections (Maternelle, Primaire, Secondaire) à inclure.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <FilterCheckboxInput
                                        name="section"
                                        placeholder="Rechercher une section..."
                                        options={SECTIONS_OPTIONS}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Groupe de Champs : Classes & Statuts (Utilisation de 2 colonnes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="classrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <div>
                                        <FormLabel>Classes</FormLabel>
                                        <FormDescription>
                                            Sélectionnez les classes à exporter.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <FilterCheckboxInput
                                            name="classe"
                                            placeholder="Rechercher une classe..."
                                            options={classrooms}
                                            value={field.value}
                                            onChangeValue={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <div>
                                        <FormLabel>Statut des Élèves</FormLabel>
                                        <FormDescription>
                                            Filtrez par statut (ex: En Cours, Diplômé).
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <FilterCheckboxInput
                                            name="statut"
                                            placeholder="Rechercher un statut..."
                                            options={STATUS_OPTIONS}
                                            value={field.value}
                                            onChangeValue={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                {children}
            </form>
        </Form>
    );
});

DocumentEnrollmentForm.displayName = "DocumentEnrollmentForm";