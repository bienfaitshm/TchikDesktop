import React, { useEffect } from "react";
import { SuspenseProvider } from "@/renderer/providers/supense";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { createConfiguration, getConfiguration } from "@/renderer/libs/apis/configuration"
import { useControlledForm } from "@/camons/libs/forms";
import z from "zod";
import { Form, FormControl, FormField, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const schema = z.object({
  name: z.string()
})

const Home: React.FC = () => {
  const [form, onSubmit] = useControlledForm({
    schema,
    defaultValues: { name: "" },
    onSubmit(data) {
      createConfiguration(data.name).then(res => {
        console.log("Result", res)
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
              <Button>Submit</Button>
            </form>
          </Form>
        </SuspenseProvider>
      </div>
    </ScrollArea>
  );
};

export default Home;
