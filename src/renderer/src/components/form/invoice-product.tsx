import { useRef, useImperativeHandle, forwardRef } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@renderer/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select";
import { Input } from "@renderer/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@renderer/components/ui/button";
import { invoiceProductSchemas } from "@renderer/libs/schemas";
type TProductInvoice = {
  id: number | string;
  nom: string;
};
type TInvoiceProductSchema = z.infer<typeof invoiceProductSchemas>;
export type InvoiceProductFormProps = {
  defaultValue?: Partial<TInvoiceProductSchema>;
  products: TProductInvoice[];
  onSubmit(product: TInvoiceProductSchema): void;
};
export type InvoiceProductFormRef = {
  handlerSubmit(): void;
};
const _defaultValues: Partial<TInvoiceProductSchema> = {
  quantity: 0,
};
const InvoiceProductForm = forwardRef<
  InvoiceProductFormRef,
  InvoiceProductFormProps
>(({ onSubmit, defaultValue, products }, ref) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const form = useForm<TInvoiceProductSchema>({
    resolver: zodResolver(invoiceProductSchemas),
    defaultValues: {
      ...defaultValue,
      ..._defaultValues,
    },
  });
  useImperativeHandle(
    ref,
    () => ({
      handlerSubmit(): void {
        btnRef.current?.click();
      },
    }),
    []
  );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id.toString()}
                      >
                        {product.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* <FormDescription>
                You can manage email addresses in your{" "}
                <Link href="/examples/forms">email settings</Link>.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantite</FormLabel>
                <Input type="number" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button ref={btnRef} type="submit" className="hidden">
          Submit
        </Button>
      </form>
    </Form>
  );
});

InvoiceProductForm.displayName = "InvoiceProductForm";
export default InvoiceProductForm;
