import { useRef, useImperativeHandle, forwardRef } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@renderer/components/ui/form";
import { Input } from "@renderer/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import { clientSchemas } from "@renderer/libs/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { LabelFormContainer } from "@renderer/components/label-form-container";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

type TClientSchemas = z.infer<typeof clientSchemas>;

export type ClientFormProps = {
  defaultValues?: Partial<TClientSchemas>;
  onSubmit(values: TClientSchemas): void;
};

export type ClientFormRef = {
  handlerSubmit(): void;
};

const _defaultValues: Partial<TClientSchemas> = {};

const ClientForm = forwardRef<ClientFormRef, ClientFormProps>(
  ({ onSubmit, defaultValues }, ref) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const form = useForm<TClientSchemas>({
      resolver: zodResolver(clientSchemas),
      defaultValues: {
        ...defaultValues,
        ..._defaultValues,
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
        <form
          className="space-y-4 w-full"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <LabelFormContainer label="Information personnelle">
            <div className="grid grid-cols-3 gap-4">
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
                name="postnom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postnom</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prenom</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </LabelFormContainer>
          <Separator />
          <LabelFormContainer label="Contacts">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adress</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </LabelFormContainer>
          <Button ref={btnRef} type="submit" className="hidden">
            Submit
          </Button>
        </form>
      </Form>
    );
  }
);

export default ClientForm;
