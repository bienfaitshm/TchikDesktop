import React from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@renderer/components/ui/command"

export type Section<T> = { title: string; data: T[] }
export type FlatListCommandProps<T> = {
  data: Section<T>[]
  renderItem(e: { item: T }): React.JSX.Element
}

export default function FlatListCommand<T>({
  data,
  renderItem,
}: FlatListCommandProps<T>): React.JSX.Element {
  return (
    <Command className="w-full bg-inherit">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {data.map((section) => (
          <CommandGroup key={section.title} heading={section.title}>
            {section.data.map((item, index) => (
              <CommandItem key={index}>{renderItem({ item })}</CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}
