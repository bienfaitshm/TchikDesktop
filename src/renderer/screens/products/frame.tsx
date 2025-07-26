import React, { useRef } from "react";
import { DataTable } from "@renderer/components/data-table/data-table";
import { columns } from "./data-list/columns";
import { useDataTable } from "@renderer/components/data-table/table-utils";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import { DataTablePagination } from "@renderer/components/data-table/data-table-pagination";
import { Separator } from "@renderer/components/ui/separator";
import { DataTableToolbar } from "@renderer/components/data-table/data-table-toolbar";
import { Input } from "@renderer/components/ui/input";
import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import { useCreateProduct } from "@renderer/apis/mutations";
import { ButtonForm } from "@renderer/components/button-form";
import ProductForm, {
  ProductFormRef,
} from "@renderer/components/form/product-form";
import { TProduit } from "@renderer/apis/type";
import { Plus } from "lucide-react";
import { useQueryClient } from "react-query";
import { useGetCategories } from "@renderer/apis/queries";
import type { WithDBValues, TCategory } from "@camontype/index";

const InputProductDialog: React.FC = () => {
  const btnRef = useRef<ProductFormRef>(null);
  const { data: categories } = useGetCategories<
    WithDBValues<TCategory>[],
    unknown
  >();
  const mutation = useCreateProduct();
  const queryClient = useQueryClient();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-8 px-2 lg:px-3">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="w-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
          <DialogDescription>Ajouter des produits facilement</DialogDescription>
        </DialogHeader>
        <ProductForm
          ref={btnRef}
          categories={categories}
          onSubmit={(values) =>
            mutation.mutate(values, {
              onSuccess(data) {
                queryClient.setQueryData<TProduit[]>(
                  ["products"],
                  (oldData) => {
                    return [data, ...(oldData || [])];
                  }
                );
              },
            })
          }
        />
        <DialogFooter>
          <ButtonForm
            isPending={mutation.isLoading}
            isPendingText="Enregistrement..."
            onClick={() => btnRef.current?.handlerSubmit()}
          >
            Enregistrer
          </ButtonForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ProductList({
  itens = [],
}: {
  itens?: TProduit[];
}): React.JSX.Element {
  const table = useDataTable({ data: itens, columns: columns });
  return (
    <div className="h-full">
      <div className=" max-w-5xl m-auto my-3">
        <div className="my-5">
          <h1 className="text-lg font-semibold">Produit</h1>
        </div>
        <div className="flex justify-between">
          <Input
            placeholder="Nom du produit"
            value={(table.getColumn("nom")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nom")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <div className="flex gap-4">
            <InputProductDialog />
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
