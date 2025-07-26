import { Tooltip, TooltipContent, TooltipTrigger } from "@/renderer/components/ui/tooltip"
import { Button } from "@/renderer/components/ui/button"
import ButtonMore, { TButtonMore } from "./button-more"

//
export type TMenu =
  | TButtonMore
  | {
    icon: React.JSX.Element
    action: () => void
    info: string
    type: "button"
    text?: string
    variant?: unknown
  }

export type ButtonActionsProps = {
  menus?: TMenu[]
}

export default function ButtonActions({ menus = [] }: ButtonActionsProps): React.JSX.Element {
  const buttons = menus.filter((button) => button.type === "button")
  const submenus = menus.filter((btn) => btn.type === "submenu") as TButtonMore[]

  return (
    <div className="flex justify-end items-end gap-2">
      {buttons.map((btn) => (
        <Tooltip delayDuration={0} key={btn.info}>
          <TooltipTrigger asChild>
            <Button
              onClick={btn.action}
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              {btn.icon}
              <span className="sr-only">{btn.info}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="flex items-center gap-4">
            {btn.info}
          </TooltipContent>
        </Tooltip>
      ))}

      {/* more button */}
      {submenus.length > 0 && <ButtonMore menus={submenus} />}
    </div>
  )
}
