import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  //   DropdownMenuRadioGroup,
  //   DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  //   DropdownMenuSub,
  //   DropdownMenuSubContent,
  //   DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import { Button } from "@renderer/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

import { MoreVertical } from "lucide-react";
import { Separator } from "@renderer/components/ui/separator";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import { useParams } from "react-router-dom";
import { Suspense } from "react";
import { useGetClient } from "@renderer/apis/queries";
import { useUpdateClient } from "@renderer/apis/mutations";
import { TClient } from "@renderer/apis/type";
import ClientForm, {
  ClientFormRef,
} from "@renderer/components/form/client-form";
import { ButtonForm } from "@renderer/components/button-form";

const EditClient: React.FC<{
  defaultValues?: TClient & { id?: string | number };
}> = ({ defaultValues }) => {
  const clientFormRef = useRef<ClientFormRef>(null);
  const { isLoading, mutate } = useUpdateClient();
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Modifier</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="min-w-[50rem]">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Modifier les infos du client. Click sur enregister lorsque vous avez
            a modifier.
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          defaultValues={defaultValues}
          onSubmit={(values) =>
            mutate({ id: defaultValues?.id as string, ...values })
          }
          ref={clientFormRef}
        />
        <DialogFooter>
          <ButtonForm
            onClick={() => {
              clientFormRef.current?.handlerSubmit();
            }}
            isPending={isLoading}
            isPendingText="Enregistrement..."
          >
            Enregistrer
          </ButtonForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SupenseLoaderClient: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client } = useGetClient<TClient, unknown>(clientId as string);
  return (
    <>
      <div className="grid grid-cols-2 p-5 h-[138px]">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <h1 className="text-xl font-bold uppercase">
              {`${client?.nom} ${client?.postnom} ${client?.prenom}`}
            </h1>
          </div>
          <h4 className="text-muted-foreground">{client?.contact}</h4>
          <span className="text-muted-foreground">{client?.adress}</span>
        </div>
        <div className="flex justify-end items-end gap-2">
          <EditClient defaultValues={client} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                {/* <DotIcon className="h-4 w-4" /> */}
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 />
                <span className="ml-2">Supprimer</span>
                <DropdownMenuShortcut>Del</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100%-140px)] p-5 pt-0"></ScrollArea>
    </>
  );
};

export default function DetailClient(): React.JSX.Element {
  return (
    <div className="h-full">
      <Suspense fallback={<h1>Chargement</h1>}>
        <SupenseLoaderClient />
      </Suspense>
    </div>
  );
}
