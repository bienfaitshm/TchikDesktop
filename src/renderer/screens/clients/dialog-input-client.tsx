import { PropsWithChildren } from "react";
import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import ClientInputForm from "@renderer/components/form/client-form";

export function DialogInputClient({ children }: PropsWithChildren) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[50rem]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {/* <ClientInputForm
          mutationKey={["client/create"]}
          action={(values) => window.api.client.create(values)}
          onSuccess={(data) => {
            console.log("Success ", data);
          }}
          onError={(error) => {
            console.log("Error ", error);
          }}
        /> */}

        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
