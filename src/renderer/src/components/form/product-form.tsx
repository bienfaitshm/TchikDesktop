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
import { produitSchemas } from "@renderer/libs/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@renderer/components/ui/button";
import { LabelFormContainer } from "../label-form-container";
import { Separator } from "@renderer/components/ui/separator";

type TFormProductSchema = z.infer<typeof produitSchemas>;
export type ProductFormProps = {
  categories?: { id: number | string; nom: string }[];
  defaultValue?: Partial<TFormProductSchema>;
  onSubmit(product: TFormProductSchema): void;
};
export type ProductFormRef = {
  handlerSubmit(): void;
};
const _defaultValues: Partial<TFormProductSchema> = {
  tva: 0,
  price: 0.0,
};
const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(
  ({ onSubmit, defaultValue, categories = [] }, ref) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const form = useForm<TFormProductSchema>({
      resolver: zodResolver(produitSchemas),
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
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <Input className="col-span-3" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
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
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.nom}
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
            <Separator />
            <LabelFormContainer label="Prix">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix unitaire</FormLabel>
                      <Input type="number" className="col-span-3" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tva (%)</FormLabel>
                      <Input type="number" className="col-span-3" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </LabelFormContainer>
          </div>
          <Button ref={btnRef} type="submit" className="hidden">
            Submit
          </Button>
        </form>
      </Form>
    );
  }
);

ProductForm.displayName = "ProductForm";
export default ProductForm;
