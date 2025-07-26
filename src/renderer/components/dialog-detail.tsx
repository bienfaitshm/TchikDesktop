import { Dialog, DialogContent, DialogTrigger } from "@renderer/components/ui/dialog"

import React from "react"

type DialogDetailProps = {
  trigger: React.ReactNode
  header?: React.ReactNode
}

export function DialogDetail({
  header,
  children,
  trigger,
}: React.PropsWithChildren<DialogDetailProps>): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="h-[calc(100%-30px)] max-w-6xl overflow-hidden p-0">
        {header}
        {children}
      </DialogContent>
    </Dialog>
  )
}
