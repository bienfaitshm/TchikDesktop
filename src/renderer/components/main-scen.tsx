import React, { PropsWithChildren } from "react"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { Separator } from "@renderer/components/ui/separator"
import {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
} from "@renderer/components/ui/resizable"

type MainScenProps = {
  side?: React.ReactNode
  sideAction?: React.ReactNode
  headerSideAction?: React.ReactNode
}
const MainScen: React.FC<PropsWithChildren<MainScenProps>> = ({
  sideAction,
  headerSideAction,
  children,
  side,
}) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
      <ResizablePanel defaultSize={25} maxSize={50} minSize={25}>
        {side}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>{children}</ResizablePanel>
    </ResizablePanelGroup>
    // {/* <aside className="h-full w-1/5 mr-2 ">
    //   <div className="h-[100px] w-full">{headerSideAction}</div>
    //   <Separator />
    //   <div className="h-[calc(100%-100px)] border-r">
    //     <ScrollArea className="h-full w-full">{sideAction}</ScrollArea>
    //   </div>
    // </aside>
    // <main className="h-full w-4/5">
    //   <ScrollArea className="h-full w-full">{children}</ScrollArea>
    // </main> */}
  )
}

export default MainScen
