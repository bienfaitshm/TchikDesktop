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
} from "@renderer/components/ui/dropdown-menu"
import { Button } from "@renderer/components/ui/button"
import { MoreVertical } from "lucide-react"

export type TButtonMore = {
  icon: React.JSX.Element
  action: () => void
  info: string
  type: "submenu"
  inSeparator?: boolean
  text?: string
  variant?: unknown
  command?: string
}

export type ButtonMoreProps = {
  menus: TButtonMore[]
}

export default function ButtonMore({ menus }: ButtonMoreProps): React.JSX.Element {
  const submenuSeparator = menus.filter((btn) => btn.type === "submenu" && btn.inSeparator)
  const submenus = menus.filter((btn) => btn.type === "submenu" && !btn.inSeparator)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          {/* <DotIcon className="h-4 w-4" /> */}
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {submenus.map((menu) => (
          <DropdownMenuItem onSelect={menu.action} key={menu.info}>
            {menu.icon}
            <span className="ml-2">{menu.info}</span>
          </DropdownMenuItem>
        ))}
        {/* <DropdownMenuSub>
            <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={"Label"}>
                {[1, 2, 3, 4, 5].map((label) => (
                  <DropdownMenuRadioItem key={label} value={"label.value"}>
                    {`${label} labele`}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub> */}
        <DropdownMenuSeparator />
        {submenuSeparator.map((menu) => (
          <DropdownMenuItem onSelect={menu.action} key={menu.info}>
            {menu.icon}
            <span className="ml-2">{menu.info}</span>
            {menu.command && <DropdownMenuShortcut>{menu.command}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
