import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@renderer/components/ui/form";
import { Input } from "@renderer/components/ui/input";
import { Textarea } from "@renderer/components/ui/textarea";
import { categoriesSchemas } from "@renderer/libs/schemas";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";

type TCatgory = z.infer<typeof categoriesSchemas>;

export type CategoryProps = {
  defaultValues?: Partial<TCatgory>;
  onSubmit(values: TCatgory): void;
};

export type CategoryRef = {
  handlerSubmit(): void;
};

const _defaultValues: Partial<TCatgory> = {};

const CategoryForm = forwardRef<CategoryRef, CategoryProps>(
  ({ defaultValues, onSubmit }, ref) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const form = useForm<TCatgory>({
      resolver: zodResolver(categoriesSchemas),
      defaultValues: {
        ..._defaultValues,
        ...defaultValues,
      },
    });
    useImperativeHandle(
      ref,
      () => ({
        handlerSubmit() {
          btnRef.current?.click();
        },
      }),
      []
    );
    return (
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desciption</FormLabel>
                <Textarea {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button ref={btnRef} type="submit" className="hidden">
            Submit
          </Button>
        </form>
      </Form>
    );
  }
);

CategoryForm.displayName = "CategoryForm";
export default CategoryForm;
