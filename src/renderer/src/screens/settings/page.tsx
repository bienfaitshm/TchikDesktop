import React from "react"
import MainScen from "@renderer/components/main-scen"
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Info } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@renderer/components/ui/command"
import { Input } from "@renderer/components/ui/input"
import Framers, { useFramers } from "@renderer/components/framers"

const Frame1: React.FC = () => {
  const [state, setState] = React.useState<string>("")
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Frame 1</h2>
        <p className="text-muted-foreground">Here&apos;s a list of your tasks for this month!</p>
      </div>
      <Input value={state} onChange={({ target }) => setState(target.value)} />
    </div>
  )
}

const Frame2 = React.memo(() => {
  const [state, setState] = React.useState<string>("")
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Frame 2</h2>
        <p className="text-muted-foreground">Here&apos;s a list of your tasks for this month!</p>
      </div>
      <Input value={state} onChange={({ target }) => setState(target.value)} />
    </div>
  )
})
Frame2.displayName = "Frame2"

const frames: { [key: string]: JSX.Element } = {
  frame1: <Frame1 />,
  frame2: <Frame2 />,
}

export default function SessionPage(): JSX.Element {
  const { changeFrame, frameRef } = useFramers()
  return (
    <MainScen
      sideAction={
        <div className="h-full">
          <div className="space-y-1 p-5 absolute z-10 w-full">
            <h4 className="text-sm font-medium leading-none">Parametres</h4>
          </div>
          <div className="h-14" />
          <div className="">
            <Command className="w-full bg-background rounded-none">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem
                    onSelect={() => {
                      console.log("Clik")
                      changeFrame("frame2")
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendar</span>
                  </CommandItem>
                  <CommandItem onSelect={() => changeFrame("frame1")}>
                    <Smile className="mr-2 h-4 w-4" />
                    <span>Search Emoji</span>
                  </CommandItem>
                  <CommandItem>
                    <Calculator className="mr-2 h-4 w-4" />
                    <span>Calculator</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <CommandShortcut>⌘P</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                    <CommandShortcut>⌘B</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <CommandShortcut>⌘S</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <Info className="mr-2 h-4 w-4" />
                    <span>Apropos</span>
                    <CommandShortcut>⌘I</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      }
    >
      <div className="p-5">
        {/* <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Here&apos;s a list of your tasks for this month!</p>
        </div>
        <h1>Settings</h1> */}
        <Framers ref={frameRef} frames={frames} initialValue="frame1" />
      </div>
    </MainScen>
  )
}
