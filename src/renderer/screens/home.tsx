import React from "react";
import { DataTable, DataContentBody, DataContentHead, DataTableContent, DataTablePagination, useTableActionHandler, DataTableColumnFilter } from "@/renderer/components/tables/data-table";
import { TypographyH3 } from "@/renderer/components/ui/typography";
import { OptionForm, useFormRef, type ValueType as FormValueType } from "@/renderer/components/form/option-form"
import { FormDialog, FormDialogHeader, FormDialogTitle, FormDialogDescription } from "@/renderer/components/dialog/dialog-form"

import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu, type DataTableMenu } from "@/renderer/components/tables/columns.base";
import { OptionColumns } from "@/renderer/components/tables/columns.options";
import type { OptionAttributes } from "@/camons/types/models"
import { SECTION } from "@/camons/constants/enum";

const data: OptionAttributes[] = [
  {
    optionId: "123",
    optionName: "Scientifique",
    optionShortName: "HSC",
    schoolId: "12345",
    section: SECTION.SECONDARY
  },
  {
    optionId: "1238",
    optionName: "Pedagogie generale",
    optionShortName: "HP",
    schoolId: "12345",
    section: SECTION.SECONDARY
  }
]

const menus: DataTableMenu[] = [
  { key: "edit", label: "modifier" },
  { key: "delete", label: "Suprimer", separator: true }
]

const OptionFormMutation = () => {
  const formRef = useFormRef()
  const onSubmit = (value: FormValueType) => {
    console.log("Submit", value)
  }
  return (
    <FormDialog
      header={
        <FormDialogHeader>
          <FormDialogTitle>Creation de l&apos;option</FormDialogTitle>
          <FormDialogDescription>ici une bonne description</FormDialogDescription>
        </FormDialogHeader>
      }
      buttonTrigger={<Button size="sm">Ajout de l'option</Button>}
      children={<OptionForm ref={formRef} onSubmit={onSubmit} />}
    />
  )
}


const Home: React.FC = () => {
  const actionhandler = useTableActionHandler()

  actionhandler.on("edit", (value) => {
    console.log("Call action Edit", { value })
  })

  actionhandler.on("delete", (value) => {
    console.log("Call action Delete", { value })
  })

  const handlePressMenu = (name: string, value: any) => {
    actionhandler.trigger(name, value)
  }

  return (
    <div className="my-10 mx-auto h-full container max-w-screen-lg">
      <div>
        <TypographyH3>Section</TypographyH3>

      </div>
      <DataTable
        data={data}
        columns={enhanceColumnsWithMenu({
          onPressMenu: handlePressMenu,
          columns: OptionColumns,
          menus: menus

        })}
        keyExtractor={(item) => item.optionId}
      >
        <div className="flex items-center justify-between my-5">
          <div>
            <Button onClick={() => actionhandler.trigger("call", { name: "bienfait" })}>Bonjour</Button>
          </div>
          <div className="flex items-center gap-5">

            <DataTableColumnFilter />
            <OptionFormMutation />

          </div>
        </div>
        <DataTableContent>
          <DataContentHead />
          <DataContentBody />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};

export default Home;
