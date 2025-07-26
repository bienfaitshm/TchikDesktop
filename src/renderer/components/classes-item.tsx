import { cn } from "@renderer/utils"
import ButtonMore, { TButtonMore } from "./button-more"

type ClassesItemProps = {
  icon?: React.ReactNode
  title: string
  subTitle?: string
  menus?: TButtonMore[]
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export default function ClassesItem({
  icon,
  title,
  subTitle,
  menus = [],
  className,
  ...props
}: ClassesItemProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "bg-muted/50 hover:bg-muted/80 rounded-md p-2 flex gap-2 cursor-pointer",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="p-2 rounded-md bg-primary/30 w-14 h-14 flex justify-center items-center">
          {icon}
        </div>
      )}
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center w-full">
          <h1 className="font-bold">{title}</h1>
          {menus.length && <ButtonMore menus={menus} />}
        </div>
        {subTitle && <span className="text-muted-foreground">{subTitle}</span>}
      </div>
    </div>
  )
}
