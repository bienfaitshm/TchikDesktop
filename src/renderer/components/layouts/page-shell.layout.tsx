"use client"

import * as React from "react"
import { cn } from "@/renderer/utils"
import { ScrollArea } from "@/renderer/components/ui/scroll-area"

interface PageShellProps {
    header: React.ReactNode
    children: React.ReactNode
    maxWidth?: "xl" | "2xl" | "full"
}

interface PageShellContextType {
    isScrolled: boolean
}

export const PageShellContext = React.createContext<PageShellContextType | undefined>(undefined)

export const usePageShell = () => {
    const context = React.useContext(PageShellContext)
    if (!context) {
        throw new Error("usePageShell doit être utilisé à l'intérieur de <PageShell>")
    }
    return context
}

const MAX_WIDTH_CLASSES = {
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full"
} as const

export const PageShell = ({
    header,
    children,
    maxWidth = "2xl"
}: PageShellProps) => {
    const [isScrolled, setIsScrolled] = React.useState(true)

    const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop
        // setIsScrolled((prev) => {
        //     if (scrollTop > 10 && !prev) return true
        //     if (scrollTop <= 10 && prev) return false
        //     return prev
        // })
    }, [])

    const contextValue = React.useMemo(() => ({ isScrolled }), [isScrolled])
    // console.log("isScrolled", isScrolled) sticky 
    return (
        <PageShellContext.Provider value={contextValue}>
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
                <ScrollArea
                    onScrollCapture={handleScroll}
                    className="h-full w-full"
                >
                    <div className="flex min-h-full flex-col">
                        <header
                            className={cn(
                                "top-0 z-5 w-full pt-8 px-6 transition-all duration-500 ease-in-out lg:px-10",
                                isScrolled
                                    ? "bg-background/80 backdrop-blur-md py-3 shadow-sm"
                                    : "bg-transparent py-8"
                            )}
                        >
                            <div className={cn(
                                "mx-auto flex w-full items-center justify-between transition-all duration-500",
                                MAX_WIDTH_CLASSES[maxWidth]
                            )}>
                                {header}
                            </div>
                        </header>

                        <main className={cn(
                            "mx-auto w-full px-6 transition-all duration-500 lg:px-10 lg:pt-5",
                            // isScrolled ? "pt-6" : "pt-2",
                            MAX_WIDTH_CLASSES[maxWidth]
                        )}>
                            {children}
                        </main>
                    </div>
                </ScrollArea>
            </div>
        </PageShellContext.Provider>
    )
}

PageShell.displayName = "PageShell"