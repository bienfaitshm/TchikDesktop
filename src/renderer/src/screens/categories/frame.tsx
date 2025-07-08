import React, { useRef } from "react";
import { DataTable } from "@renderer/components/data-table/data-table";
import { columns } from "./data-list/columns";
import { useDataTable } from "@renderer/components/data-table/table-utils";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import { DataTablePagination } from "@renderer/components/data-table/data-table-pagination";
import { Separator } from "@renderer/components/ui/separator";
import { DataTableToolbar } from "@renderer/components/data-table/data-table-toolbar";
import { Input } from "@renderer/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@renderer/components/ui/dialog";

import { TCategory } from "@renderer/apis/type";
import { Button } from "@renderer/components/ui/button";
import CategoryForm, {
  CategoryRef,
} from "@renderer/components/form/category-form";
import { useCreateCategory } from "@renderer/apis/mutations";
import { ButtonForm } from "@renderer/components/button-form";
import { useToast } from "@renderer/components/ui/use-toast";

const AddCatgoryButtonDialog: React.FC = () => {
  const btnCloseRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<CategoryRef>(null);
  const { toast } = useToast();
  const mutation = useCreateCategory();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-8 px-2 lg:px-3">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[30rem]">
        <DialogHeader>
          <DialogTitle>Ajouter une Categorie</DialogTitle>
          <DialogDescription>
            Categoriser vos produits, cela vous aider a economiser trop de temps
            dans la recherche
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          ref={formRef}
          onSubmit={(values) =>
            mutation.mutate(values, {
              onSuccess() {
                btnCloseRef.current?.click();
                toast({
                  variant: "default",
                  title: "Ajoute",
                  description: "Votre categorie a ete bien ajoute",
                });
              },
            })
          }
        />
        <DialogFooter>
          <DialogClose>
            <button ref={btnCloseRef} className="hidden" />
          </DialogClose>
          <ButtonForm
            onClick={() => formRef.current?.handlerSubmit()}
            isPending={mutation.isLoading}
            isPendingText="Enregistrement..."
          >
            Enregistrer
          </ButtonForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ProductList({
  categories = [],
}: {
  categories?: TCategory[];
}): React.JSX.Element {
  const table = useDataTable({ data: categories, columns: columns });
  return (
    <div className="h-full">
      <div className=" max-w-5xl m-auto my-3">
        <div className="my-5">
          <h1 className="text-lg font-semibold">Categorie</h1>
        </div>
        <div className="flex justify-between">
          <Input
            placeholder="Nom de la categorie"
            value={(table.getColumn("nom")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nom")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <div className="flex gap-4">
            <AddCatgoryButtonDialog />
            <DataTableToolbar table={table} />
          </div>
        </div>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100%-200px)]">
        <div className="max-w-5xl m-auto">
          <DataTable table={table} columns={columns} />
        </div>
      </ScrollArea>
      <Separator />
      <div className="max-w-5xl mx-auto my-2 h-[200px]">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
