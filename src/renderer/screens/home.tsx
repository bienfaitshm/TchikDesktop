import React from "react";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  useTableActionHandler,
  DataTableColumnFilter,
} from "@/renderer/components/tables/data-table";
import { TypographyH3 } from "@/renderer/components/ui/typography";
import { OptionForm, useFormRef, type OptionFormData as FormValueType } from "@/renderer/components/form/option-form";
import { FormDialog, useFormDialogRef } from "@/renderer/components/dialog/dialog-form";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns.base";
import { OptionColumns } from "@/renderer/components/tables/columns.options";
import type { OptionAttributes } from "@/camons/types/models";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { SECTION } from "@/camons/constants/enum";
import { Pencil, Trash2 } from "lucide-react";
import { DialogConfirmDelete, useDialogConfirmDelete } from "../components/dialog/dialog-delete";
import { ButtonLoader } from "../components/form/button-loader";
import { useImperativeUpdateDialog, useUpdateDialogRef, withUpdateDialog } from "../components/dialog/dialog-form.update";

// --- Mock Data ---
// In a real application, this data would typically be fetched from an API.
const mockData: OptionAttributes[] = [
  {
    optionId: "123",
    optionName: "Scientifique",
    optionShortName: "HSC",
    schoolId: "12345",
    section: SECTION.SECONDARY,
  },
  {
    optionId: "1238",
    optionName: "Pedagogie generale",
    optionShortName: "HP",
    schoolId: "12345",
    section: SECTION.SECONDARY,
  },
];

// --- Data Table Menu Definitions ---
const tableMenus: DataTableMenu[] = [
  { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
  { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];

// --- Option Creation Form Component ---
const OptionCreateForm: React.FC = () => {
  const dialogRef = useFormDialogRef();
  const formRef = useFormRef();

  // Handler for form submission
  const onSubmit = (value: FormValueType) => {
    console.log("Submit new option:", value);
    // In a real app, you would send this data to your backend
    dialogRef.current?.closeDialog();
  };

  return (
    <FormDialog.Root ref={dialogRef}>
      <FormDialog.TriggerButton asChild>
        <Button size="sm">Ajout de l'option</Button>
      </FormDialog.TriggerButton>
      <FormDialog.Content>
        <FormDialog.Header>
          <FormDialog.Title>Création de l'option</FormDialog.Title>
          <FormDialog.Description>
            Remplissez les informations ci-dessous pour créer une nouvelle option.
          </FormDialog.Description>
        </FormDialog.Header>
        <FormDialog.FormWrapper>
          <OptionForm ref={formRef} onSubmit={onSubmit} />
        </FormDialog.FormWrapper>
        <FormDialog.Footer>
          <FormDialog.CloseButton asChild>
            <Button variant="outline" size="sm">Annuler</Button>
          </FormDialog.CloseButton>
          <FormDialog.SubmitButton asChild>
            <ButtonLoader>Enregistrer</ButtonLoader>
          </FormDialog.SubmitButton>
        </FormDialog.Footer>
      </FormDialog.Content>
    </FormDialog.Root>
  );
};

// --- Option Update Form Component (Higher-Order Component Pattern) ---
const OptionUpdateForm = withUpdateDialog((_, ref) => {
  const dialogRef = useFormDialogRef();
  const formRef = useFormRef();

  // Hook to get the data passed for editing and open the dialog
  const [dataToEdit] = useImperativeUpdateDialog<Omit<Partial<OptionAttributes>, "optionId">>(ref, () => {
    dialogRef.current?.openDialog();
  });

  // Handler for form submission
  const onSubmit = (value: FormValueType) => {
    console.log("Submit updated option:", value);
    // In a real app, you would send this updated data to your backend
    dialogRef.current?.closeDialog();
  };

  return (
    <FormDialog.Root ref={dialogRef}>
      <FormDialog.Content>
        <FormDialog.Header>
          <FormDialog.Title>Modifier l'option</FormDialog.Title>
          <FormDialog.Description>
            Modifiez les informations de l'option sélectionnée.
          </FormDialog.Description>
        </FormDialog.Header>
        <FormDialog.FormWrapper>
          {/* Pass initialValues to pre-fill the form with dataToEdit */}
          <OptionForm initialValues={dataToEdit} ref={formRef} onSubmit={onSubmit} />
        </FormDialog.FormWrapper>
        <FormDialog.Footer>
          <FormDialog.CloseButton asChild>
            <Button variant="outline" size="sm">Annuler</Button>
          </FormDialog.CloseButton>
          <FormDialog.SubmitButton asChild>
            <ButtonLoader>Enregistrer</ButtonLoader>
          </FormDialog.SubmitButton>
        </FormDialog.Footer>
      </FormDialog.Content>
    </FormDialog.Root>
  );
});

// --- Main Home Component ---
const Home: React.FC = () => {
  const dialogConfirmRef = useDialogConfirmDelete();
  const updateDialogRef = useUpdateDialogRef();
  const actionHandler = useTableActionHandler(); // Renamed for clarity

  // Registering action handlers for data table row menus
  actionHandler.on<OptionAttributes>("edit", (value) => {
    console.log("Action: Edit", { value });
    updateDialogRef.current?.openDialog(value); // Open update dialog with selected data
  });

  actionHandler.on("delete", (value: OptionAttributes) => {
    console.log("Action: Delete", { value });
    dialogConfirmRef.current?.openDialog(value); // Open confirmation dialog for deletion
  });

  // Handler for confirming deletion
  const onConfirmDelete = (item: unknown) => {
    console.log("Confirmed deletion for item:", item);
    // In a real app, you would send a delete request to your backend
  };

  return (
    <div className="my-10 mx-auto h-full container max-w-screen-lg">
      <div className="mb-6">
        <TypographyH3>Gestion des Options</TypographyH3>
      </div>

      <DataTable
        data={mockData}
        columns={enhanceColumnsWithMenu({
          // Directly pass the actionHandler's trigger method
          onPressMenu: (...args) => actionHandler.trigger(...args),
          columns: OptionColumns,
          menus: tableMenus,
        })}
        keyExtractor={(item) => item.optionId}
      >
        <div className="flex items-center justify-between my-5">
          {/* This button seems to be for testing; consider its purpose or remove */}
          <div>
            <Button onClick={() => console.log("Bonjour button clicked!")}>Bonjour</Button>
          </div>
          <div className="flex items-center gap-5">
            <DataTableColumnFilter />
            <OptionCreateForm />
          </div>
        </div>
        <DataTableContent>
          <DataContentHead />
          <DataContentBody />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>

      {/* Dialogs rendered at the root level for accessibility and proper overlay */}
      <DialogConfirmDelete ref={dialogConfirmRef} onConfirmDelete={onConfirmDelete} />
      <OptionUpdateForm ref={updateDialogRef} />
    </div>
  );
};

export default Home;