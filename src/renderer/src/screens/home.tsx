import React from "react";
import { SuspenseProvider } from "@/renderer/providers/supense";
import { useControlledForm } from "@/camons/libs/forms";
import z from "zod";
import { Form, FormControl, FormField, FormMessage, FormItem, FormLabel } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { useCreateUser, useGetUsers } from "../libs/queries/account";
import { ButtonLoader } from "../components/form/button-loader";

const schema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty()
})

const Home: React.FC = () => {
  const { data: configurations } = useGetUsers()
  const mutation = useCreateUser()

  const [form, onSubmit] = useControlledForm({
    schema,
    defaultValues: { firstName: "", lastName: "" },
    onSubmit(value) {
      mutation.mutate(value, {
        onError(error,) {
          console.log("error", error)
        },
        onSuccess(data) {
          console.log("success", data)
          form.reset()
        },
      })
    },
  })

  return (
    <div className="my-10 mx-auto h-full container max-w-screen-md">
      <div>
        <code>{JSON.stringify(configurations, null, 4)}</code>
      </div>
      <SuspenseProvider>
        <Form {...form}>
          <form className="space-y-5" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prenom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ButtonLoader isLoading={mutation.isPending} isLoadingText="Submiting">Submit</ButtonLoader>
          </form>
        </Form>
      </SuspenseProvider>
    </div>
  );
};

export default Home;
