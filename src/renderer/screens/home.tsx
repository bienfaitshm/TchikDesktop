"use client";

// import { AdvancedSearchEngine } from "@/renderer/components/search-engin";
// import { DashBoardPage } from "./dashboard";
import { ScrollArea } from "../components/ui/scroll-area";
import { BulkOptionView } from "../components/form/bulkoption";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";

import { User, Settings, LogOut, CreditCard, Users } from "lucide-react";
import { DialogForm } from "@/renderer/components/dialog/form";
import { Button } from "../components/ui/button";
import { DropdownMenuItem } from "../components/ui/dropdown-menu";

export const Example = () => (
  <ActionMenu
    trigger={<Button>Options</Button>}
    dialogs={
      <>
        <MenuDialogWrapper id="delete-account">
          <DialogForm title="Suppression">
            <h1>Deleting</h1>
          </DialogForm>
        </MenuDialogWrapper>
        <MenuDialogWrapper id="edit-profile">
          <DialogForm title="Modification">
            <h1>Editing</h1>
          </DialogForm>
        </MenuDialogWrapper>
      </>
    }
  >
    <DropdownMenuItem>Lien classique</DropdownMenuItem>
    <MenuDialogItem targetId="delete-account">
      Supprimer le compte
    </MenuDialogItem>
    <MenuDialogItem targetId="edit-profile">Modifier le profil</MenuDialogItem>
  </ActionMenu>
);

export const HomePage = () => {
  return (
    <ScrollArea className="h-full w-full">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-background container max-w-7xl">
        {/* <DashBoardPage /> */}
        <Example />
        <BulkOptionView />
      </div>
    </ScrollArea>
  );
};
