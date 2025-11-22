import { forwardRef, useMemo, useState, type PropsWithChildren } from "react";
import { useControlledForm } from "@/commons/libs/forms";
import { SECTION, SECTION_TRANSLATIONS, STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS } from "@/commons/constants/enum";
import { type DocumentExportSchemaAttributes, DocumentExportSchema } from "@/renderer/libs/schemas";
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
} from "@/renderer/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover"
import { useFormImperativeHandle, type ImperativeFormHandle } from "../utils";
import { getEnumKeyValueList } from "@/commons/utils";
import { FilterCheckboxInput } from "../fields/filter-checkbox-input";
import { DOCUMENT_METADATA, DOCUMENT_TYPE } from "@/commons/libs/document";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/renderer/utils";
import { Button } from "../../ui/button";
import type { GroupedDocumentOption } from "./utils";



export * from "../utils";

export type DocumentEnrollmentFormData = DocumentExportSchemaAttributes;



const DEFAULT_VALUES: DocumentEnrollmentFormData = {
    schoolId: "",
    yearId: "",
    documentType: DOCUMENT_TYPE.STUDENT_LIST,
    classrooms: [],
    status: [STUDENT_STATUS.EN_COURS],
    sections: [SECTION.SECONDARY, SECTION.PRIMARY, SECTION.KINDERGARTEN],
};

const SECTIONS_OPTIONS = getEnumKeyValueList(SECTION, SECTION_TRANSLATIONS);
const STATUS_OPTIONS = getEnumKeyValueList(STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS);

type DocumentTypeSelectProps = {
    options: GroupedDocumentOption[],
    value: string,
    onChangeValue: (value: string) => void
}

export const DocumentTypeSelect: React.FC<DocumentTypeSelectProps> = ({ onChangeValue, value, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedDocument = useMemo(() => DOCUMENT_METADATA[value], [value]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between h-auto py-2 px-4 text-left"
                >
                    <div className="flex flex-col items-start space-y-1">
                        <span className="font-semibold text-xs">{selectedDocument.title}</span>
                        <span className="text-xs font-normal text-muted-foreground text-wrap">{selectedDocument.subTitle}</span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" side="right" align="start">
                <Command>
                    <CommandInput placeholder="Rechercher un document..." />
                    <CommandList>
                        <CommandEmpty>Aucun document trouvé.</CommandEmpty>
                        {options.map(({ section, data: documents }) => (
                            <CommandGroup key={section} heading={section}>
                                {documents.map((doc) => (
                                    <CommandItem
                                        key={doc.value}
                                        value={doc.label.title}
                                        onSelect={() => {
                                            onChangeValue(doc.value);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="flex flex-col w-full">
                                            <p className="font-medium text-xs">{doc.label.title}</p>
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
    onSubmit?: (value: DocumentEnrollmentFormData) => void;
    initialValues?: Partial<DocumentEnrollmentFormData>;
    classrooms?: { label: string; value: string }[];
    documentInfos?: GroupedDocumentOption[]
}

export interface DocumentEnrollmentFormHandle extends ImperativeFormHandle<DocumentEnrollmentFormData> { }

export const DocumentEnrollmentForm = forwardRef<
    DocumentEnrollmentFormHandle,
    PropsWithChildren<DocumentEnrollmentFormProps>
>(({ children, onSubmit, initialValues = {}, classrooms = [], documentInfos = [] }, ref) => {
    // 
    const [form, handleSubmit] = useControlledForm({
        schema: DocumentExportSchema,
        defaultValues: { ...DEFAULT_VALUES, ...initialValues },
        onSubmit,
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mx-1 space-y-4">
                    <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                            <FormItem>
                                <div>
                                    {/* Le label est plus descriptif et indique clairement l'action */}
                                    <FormLabel className="text-xs">Type de document à exporter</FormLabel>
                                    {/* La description est plus claire et conviviale */}
                                    <FormDescription className="text-xs">
                                        Choisissez un type de document pour l'exportation.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <DocumentTypeSelect
                                        options={documentInfos}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sections"
                        render={({ field }) => (
                            <FormItem>
                                <div>
                                    {/* Le label est plus descriptif et indique clairement l'action */}
                                    <FormLabel className="text-xs">Sections</FormLabel>
                                    {/* La description est plus claire et conviviale */}
                                    <FormDescription className="text-xs">
                                        Cochez les sections que vous souhaitez inclure dans le document exporté.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <FilterCheckboxInput
                                        name="section"
                                        // Le placeholder suggère une action de recherche ou de filtrage
                                        placeholder="Rechercher une section..."
                                        options={SECTIONS_OPTIONS}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="classrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <div>
                                        {/* Le label est plus direct et actionnable */}
                                        <FormLabel className="text-xs">Classes</FormLabel>
                                        {/* La description est plus explicite sur le nombre de choix possibles */}
                                        <FormDescription className="text-xs">
                                            Sélectionnez les classes à exporter
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <FilterCheckboxInput
                                            name="classe"
                                            // Le placeholder guide l'utilisateur vers l'action de recherche
                                            placeholder="Rechercher une classe..."
                                            options={classrooms}
                                            value={field.value}
                                            onChangeValue={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <div>
                                        {/* Le label est plus direct et actionnable */}
                                        <FormLabel className="text-xs">Statut</FormLabel>
                                        {/* La description est plus explicite sur le nombre de choix possibles */}
                                        <FormDescription className="text-xs">
                                            Sélectionnez les statuts des élèves  à exporter
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <FilterCheckboxInput
                                            name="statut"
                                            // Le placeholder guide l'utilisateur vers l'action de recherche
                                            placeholder="Rechercher un statut..."
                                            options={STATUS_OPTIONS}
                                            value={field.value}
                                            onChangeValue={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
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