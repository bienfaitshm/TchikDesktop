import React, { Suspense } from "react";
import { Plus } from "lucide-react";
import MainScen from "@renderer/components/main-scen";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import { Button } from "@renderer/components/ui/button";
import { Separator } from "@renderer/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem,
} from "@renderer/components/ui/command";
import { NavLink, Outlet } from "react-router-dom";
import { useGetClients } from "@renderer/apis/queries";
import { TClient, TID } from "@renderer/apis/type";
import { DialogInputClient } from "./dialog-input-client";

const SuspenseLoadDataClients: React.FC = () => {
  const { data: clients } = useGetClients<(TClient & { id: TID })[], object>();
  console.log({ clients });
  return (
    <React.Fragment>
      {clients?.map((client) => (
        <NavLink to={`/clients/${client.id}`} key={client.id}>
          {() => (
            <CommandItem className="my-2">
              <h1>{`${client.nom} ${client.postnom} ${client.prenom}`}</h1>
            </CommandItem>
          )}
        </NavLink>
      ))}
    </React.Fragment>
  );
};
export default function SessionPage(): React.JSX.Element {
  // return <MailPage />
  return (
    <MainScen
      side={
        <React.Fragment>
          <Command>
            <div className="w-full">
              <div className="space-y-1 px-4 pt-5 pb-2">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="uppercase text-sm font-medium leading-none">
                    clients
                  </h4>
                </div>
                <div className="flex w-full gap-2">
                  <CommandInput
                    placeholder="Recherche du nom du client"
                    containerClassName="w-full border-b-0"
                    className="w-full"
                  />
                  {/* <DialogInputClient>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">ajouter</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="flex items-center gap-4"
                      >
                        ajouter un client
                      </TooltipContent>
                    </Tooltip>
                  </DialogInputClient> */}
                </div>
              </div>
              <Separator />
            </div>
            <ScrollArea className="h-full">
              <CommandList className="px-2 space-y-2">
                <CommandEmpty>Aucun resultat</CommandEmpty>
                <Suspense>
                  <SuspenseLoadDataClients />
                </Suspense>
              </CommandList>
            </ScrollArea>
          </Command>
        </React.Fragment>
      }
    >
      <Outlet />
    </MainScen>
  );
}
