import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { DataTablePagination } from "@renderer/components/data-table/data-table-pagination"
import { DataTableToolbar } from "@renderer/components/data-table/data-table-toolbar"
import { useDataTable } from "@renderer/components/data-table/table-utils"
import { columns } from "@renderer/components/data-table/columns"
import tasks from "@renderer/components/data-table/data/tasks.json"
import { DialogDetail } from "./dialog-detail"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { DataTable } from "./data-table/data-table"
import { Separator } from "@renderer/components/ui/separator"
import { Input } from "./ui/input"

/**
 *
 * @returns
 */
type DialogTableProps = {
  trigger: React.ReactNode
}
export default function DialogTable({ trigger }: DialogTableProps): React.JSX.Element {
  const table = useDataTable({ data: tasks, columns })
  return (
    <div>
      <DialogDetail trigger={trigger}>
        <DialogHeader className="p-5 pb-1">
          <div>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </div>
          <div>
            <Input
              placeholder="Filter tasks..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
          <div className="my-3" />
          <DataTableToolbar table={table} />
        </DialogHeader>
        <Separator />
        <ScrollArea className="h-full">
          <DataTable columns={columns} table={table} />
        </ScrollArea>
        <Separator />
        <div className="m-3 mb-5 p-2">
          <DataTablePagination table={table} />
        </div>
      </DialogDetail>
    </div>
  )
}
