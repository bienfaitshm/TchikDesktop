import { forwardRef, type PropsWithChildren } from "react";
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
import { useFormImperativeHandle, type ImperativeFormHandle } from "../utils";
import { getEnumKeyValueList } from "@/commons/utils";
import { FilterCheckboxInput } from "../fields/filter-checkbox-input";


export * from "../utils";

export type DocumentEnrollmentFormData = DocumentExportSchemaAttributes;

const DEFAULT_VALUES: DocumentEnrollmentFormData = {
    schoolId: "",
    yearId: "",
    classrooms: [],
    status: [STUDENT_STATUS.EN_COURS],
    sections: [SECTION.SECONDARY, SECTION.PRIMARY, SECTION.KINDERGARTEN],
};

const SECTIONS_VALUES = getEnumKeyValueList(SECTION, SECTION_TRANSLATIONS);
const STATUS_VALUE = getEnumKeyValueList(STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS);

export interface DocumentEnrollmentFormProps {
    onSubmit?: (value: DocumentEnrollmentFormData) => void;
    initialValues?: Partial<DocumentEnrollmentFormData>;
    classrooms?: { label: string; value: string }[];
}

export interface DocumentEnrollmentFormHandle extends ImperativeFormHandle<DocumentEnrollmentFormData> { }

export const DocumentEnrollmentForm = forwardRef<
    DocumentEnrollmentFormHandle,
    PropsWithChildren<DocumentEnrollmentFormProps>
>(({ children, onSubmit, initialValues = {}, classrooms = [] }, ref) => {
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
                                        options={SECTIONS_VALUES}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
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
                                            options={STATUS_VALUE}
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