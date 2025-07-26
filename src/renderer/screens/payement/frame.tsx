import { DataTable } from "@renderer/components/data-table/data-table";
// import { taskSchema } from "@renderer/components/data-table/data/schema"
import { columns } from "./data-list/columns";
import { useDataTable } from "@renderer/components/data-table/table-utils";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import { DataTablePagination } from "@renderer/components/data-table/data-table-pagination";
import { Separator } from "@renderer/components/ui/separator";
import { DataTableToolbar } from "@renderer/components/data-table/data-table-toolbar";
import { Input } from "@renderer/components/ui/input";
import { TInvoice } from "@camontype/index";

// Simulate a database read for tasks.
type FrameProps = {
  invoices?: TInvoice[];
};

const Frame: React.FC<FrameProps> = ({ invoices = [] }): React.ReactNode => {
  const table = useDataTable({ data: invoices, columns: columns });
  return (
    <div className="h-full">
      <div className=" max-w-5xl m-auto my-3">
        <div className="my-5">
          <h1 className="text-lg font-semibold">Factures</h1>
        </div>
        <div className="flex justify-between">
          <Input
            placeholder="Numero de la facture"
            value={
              (table.getColumn("nInvoice")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("nInvoice")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />

          <DataTableToolbar table={table} />
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
};

export default Frame;
