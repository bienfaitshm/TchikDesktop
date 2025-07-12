import React, { useEffect } from "react";
import { SuspenseProvider } from "@/renderer/providers/supense";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { createConfiguration, getConfiguration } from "@/renderer/libs/apis/configuration"
import { useControlledForm } from "@/camons/libs/forms";
import z from "zod";
import { Form, FormControl, FormField, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useCreateConfiguration, useGetConfiguration } from "../libs/queries/configuration";
import { ButtonLoader } from "../components/form/button-loader";

const schema = z.object({
  name: z.string()
})

const Home: React.FC = () => {
  const { data: configurations } = useGetConfiguration()
  const mutation = useCreateConfiguration()

  const [form, onSubmit] = useControlledForm({
    schema,
    defaultValues: { name: "" },
    onSubmit(value) {
      mutation.mutate(value, {
        onError(error, variables, context) {
          console.log("error", error)
        },
        onSuccess(data, variables, context) {
          console.log("success", data)
        },
      })
    },
  })
  // useEffect(() => {
  //   (async () => {
  //     const data = await getConfiguration()
  //     console.log("Data...", data)
  //   })()

  // }, [])

  return (
    <ScrollArea className="h-full">
      <div>
        <h3>{JSON.stringify(configurations, null, 4)}</h3>
      </div>
      <div className="my-10 h-full container max-w-screen-lg">
        <SuspenseProvider>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormControl>
                    <Input {...field} />
                    {/* <FormMessage /> */}
                  </FormControl>
                )}
              />
              <ButtonLoader isLoading={mutation.isLoading} isLoadingText="Submiting">Submit</ButtonLoader>
            </form>
          </Form>
        </SuspenseProvider>
      </div>
    </ScrollArea>
  );
};

export default Home;
