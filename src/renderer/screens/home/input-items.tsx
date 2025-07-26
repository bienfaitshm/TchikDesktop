import React, { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  //   DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import { Input } from "@renderer/components/ui/input";
import {
  Select,
  SelectContent,
  //   SelectGroup,
  SelectItem,
  //   SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select";
import {
  Form,
  FormControl,
  //   FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@renderer/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod"
import { useGetItems, usePostInvoice } from "@renderer/apis/queries";
import { useInvoiceState } from "./state";
import { TProduct } from "../products/data-list/type";
import {
  getAmountTotalWithTVA,
  getAmountTVA,
} from "@renderer/utils/camputed-value";

const FormSchema = z.object({
  code: z.string(),
  quantity: z.number(),
});

type TSelectedItemListRef = {
  getSelectedItem(code: number | string): TProduct | undefined;
};
const SelectedItemList = React.forwardRef<
  TSelectedItemListRef,
  {
    onValueChange?(value: string): void;
    defaultValue: string;
  }
>(({ defaultValue, onValueChange }, ref) => {
  const { data } = useGetItems();

  React.useImperativeHandle(
    ref,
    () => ({
      getSelectedItem(code): TProduct | undefined {
        return data?.find((item) => item.code === code);
      },
    }),
    [data]
  );

  return (
    <Suspense fallback={<h1>Chargement de produit...</h1>}>
      <Select onValueChange={onValueChange} defaultValue={defaultValue}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a verified email to display" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-64">
          {data?.map((item) => (
            <SelectItem key={item.id} value={item.code.toString()}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Suspense>
  );
});

SelectedItemList.displayName = "SelectedItemList";

export default function InputItem(): React.ReactNode {
  const [open, setOpen] = React.useState<boolean>(false);
  const refSeleted = React.useRef<TSelectedItemListRef>(null);
  const { addItem } = useInvoiceState();
  const form = useForm<z.infer<typeof FormSchema>>({
    // resolver: zodResolver(FormSchema),
    defaultValues: {
      quantity: 0,
    },
  });

  function onSubmit(_form: z.infer<typeof FormSchema>): void {
    const item = refSeleted.current?.getSelectedItem(_form.code);
    const unitePrice = getAmountTotalWithTVA(
      item?.price || 0,
      getAmountTVA(item?.price || 0, item?.tva || 0)
    );
    item &&
      addItem({
        quantity: _form.quantity,
        designation: item,
        totalPrice: (unitePrice * _form.quantity).toString(),
        unitePrice: unitePrice.toString(),
      });
    form.reset({
      code: undefined,
      quantity: 0,
    });
    setOpen(false);

    // console.log({
    //   quantity: _form.quantity,
    //   designation: item?.name,
    //   totalPrice: item?.price,
    //   unitePrice: item?.price,
    // })
  }
  return (
    <div>
      <Suspense fallback={<h1>Chargement...</h1>}>
        <Form {...form}>
          {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
          <Dialog open={open}>
            <DialogTrigger onClick={() => setOpen(true)} asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Items
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add a new item to invoice</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <SelectedItemList
                        ref={refSeleted}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          id="quantity"
                          type="number"
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setOpen(false)} variant="destructive">
                  Cancel
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)} type="submit">
                  Add item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Form>
      </Suspense>
    </div>
  );
}
