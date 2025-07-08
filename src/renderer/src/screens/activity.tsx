import { Calculator, Settings, Smile, User, LucideBell } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@renderer/components/ui/command";

import * as React from "react";
import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  HelpCircle,
  LucideIcon,
  XCircle,
} from "lucide-react";

import { cn } from "@renderer/utils";
import { Button } from "@renderer/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@renderer/components/ui/popover";
import { NavLink, Outlet } from "react-router-dom";
import appRouters from "@renderer/config";
import MailPage from "@renderer/components/email/page";
import { buttonVariants } from "@renderer/components/ui/button";
import IconImage from "@renderer/assets/icon.svg";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import ButtonSheet from "@renderer/components/buttonSheet";
import { Separator } from "@renderer/components/ui/separator";

type MToolTipProps = {
  content: JSX.Element;
};
const MToolTip: React.FC<React.PropsWithChildren<MToolTipProps>> = ({
  children,
  content,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side="right">{content}</TooltipContent>
    </Tooltip>
  );
};

type NavLinkButtonProps = {
  to: string;
  name: string;
  icon: React.ReactNode;
};

const NavLinkButton: React.FC<NavLinkButtonProps> = ({ to, icon, name }) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          " p-2 relative flex items-center justify-center w-full",
          isActive &&
            "befor:h-full before:w-[2px] before:bg-primary before:absolute before:top-0 before:bottom-0 before:left-0"
        )
      }
      to={to}
    >
      <MToolTip content={<p>{name}</p>}>{icon}</MToolTip>
    </NavLink>
  );
};

type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const statuses: Status[] = [
  {
    value: "backlog",
    label: "Backlog",
    icon: HelpCircle,
  },
  {
    value: "todo",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: ArrowUpCircle,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle2,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: XCircle,
  },
];

export function ComboboxPopover(): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );

  return (
    <div className="flex items-center space-x-4">
      <p className="text-sm text-muted-foreground">Annee acolaire currentes</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs rounded-none h-6 justify-center items-center"
          >
            {selectedStatus ? (
              <>
                <selectedStatus.icon className="mr-2 h-3 w-3 shrink-0" />
                {selectedStatus.label}
              </>
            ) : (
              <>+ Set status</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Change status..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      setSelectedStatus(
                        statuses.find((priority) => priority.value === value) ||
                          null
                      );
                      setOpen(false);
                    }}
                  >
                    <status.icon
                      className={cn(
                        "mr-2 h-4 w-4",
                        status.value === selectedStatus?.value
                          ? "opacity-100"
                          : "opacity-40"
                      )}
                    />
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const BottomActivity: React.FC = () => {
  return (
    <div className="h-full border-t text-muted text-xs flex flex-row items-center space-x-4 justify-between px-2">
      <p>Facture systeme</p>
      {/* <div className="flex">
        <ComboboxPopover />
        <ButtonSheet
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-xs rounded-none h-6 justify-center items-center"
            >
              <LucideBell className="mr-2 h-3 w-3 shrink-0" />
            </Button>
          }
        ></ButtonSheet>
      </div> */}
    </div>
  );
};

export default function Activity(): JSX.Element {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-screen">
        <div className="h-[calc(100%-25px)] relative">
          <div className="w-screen flex h-full">
            <aside className="w-[50px] h-full border-r">
              <img alt="logo" src={IconImage} height={49} />
              <Separator />
              <div className="flex flex-col justify-between py-5 h-[calc(100%-49px)]">
                <div className="flex flex-col gap-2">
                  {appRouters.map((app) => (
                    <NavLinkButton
                      key={app.url}
                      to={app.url}
                      name={app.name}
                      icon={app.icon}
                    />
                  ))}
                </div>
                <div>
                  <div>
                    <NavLinkButton
                      to="settings"
                      name="Parametres"
                      icon={<Settings />}
                    />
                  </div>
                </div>
              </div>
            </aside>
            <div id="detail" className="w-[calc(100%-50px)] overflow-hidden">
              <Outlet />
            </div>
          </div>
        </div>
        <div className="h-[25px] bg-primary z-20">
          <BottomActivity />
        </div>
      </div>
    </TooltipProvider>
  );
}
