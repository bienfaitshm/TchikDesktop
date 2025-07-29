import React from "react";
import { DataTable } from "@/renderer/components/tables";
import { TypographyH3 } from "@/renderer/components/ui/typography";
import { OptionForm, useFormRef, type ValueType as FormValueType } from "@/renderer/components/form/option-form"
import { FormDialog, FormDialogHeader, FormDialogTitle, FormDialogDescription } from "@/renderer/components/dialog/dialog-form"

import data from "@/renderer/components/tables/data.json"
import { Button } from "@/renderer/components/ui/button";

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
      buttonTrigger={<Button>Ajout de l'option</Button>}
      children={<OptionForm ref={formRef} onSubmit={onSubmit} />}
    />
  )
}


const Home: React.FC = () => {
  return (
    <div className="my-10 mx-auto h-full container max-w-screen-lg">
      <div>
        <TypographyH3>Section</TypographyH3>
        <OptionFormMutation />
      </div>
      <DataTable data={data} />
    </div>
  );
};

export default Home;
