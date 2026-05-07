"use client"

import * as React from "react"
import { NavLink, useNavigate } from "react-router"
import { Search, X, BookX, ChevronDown, ChevronLeft, Layers } from "lucide-react"

import { cn } from "@/renderer/utils"
import { Button } from "@/renderer/components/ui/button"
import { Input } from "@/renderer/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/renderer/components/ui/dropdown-menu"
import { ScrollArea } from "@/renderer/components/ui/scroll-area"

import { getSectionLabel, SECTION_OPTIONS } from "@/packages/@core/data-access/db/options"
import type { SECTION_ENUM } from "@/packages/@core/data-access/db/enum"
import { useGetClassroomGroupedBySection } from "../hooks/other"
import type { TClassroomAttributes as TClassroom } from "@/packages/@core/data-access/schema-validations"

interface ClassroomSidebarProps {
    classrooms: Required<TClassroom>[]
}

const ClassroomNavItem = React.memo(({ classroom }: { classroom: Required<TClassroom> }) => (
    <NavLink
        to={`/classrooms/${classroom.classId}/students`}
        className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 h-9 rounded-md text-xs transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
    >
        <div className="size-1 rounded-full bg-current opacity-40" />
        <span className="truncate">{classroom.identifier}</span>
    </NavLink>
))
ClassroomNavItem.displayName = "ClassroomNavItem"


export const ClassroomSidebar = ({ classrooms }: ClassroomSidebarProps) => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedSection, setSelectedSection] = React.useState("all")

    const deferredSearch = React.useDeferredValue(searchTerm.trim().toLowerCase())

    const classGrouped = useGetClassroomGroupedBySection(classrooms)

    const currentSectionLabel = React.useMemo(() => {
        if (selectedSection === "all") return "Toutes les sections"
        return SECTION_OPTIONS.find(opt => opt.value === selectedSection)?.label || "Section"
    }, [selectedSection])

    const filteredGroups = React.useMemo(() => {
        if (!deferredSearch && selectedSection === "all") return classGrouped

        return classGrouped
            .filter(g => selectedSection === "all" || g.section === selectedSection)
            .map(g => ({
                ...g,
                data: g.data.filter(c => c.identifier.toLowerCase().includes(deferredSearch))
            }))
            .filter(g => g.data.length > 0)
    }, [classGrouped, deferredSearch, selectedSection])

    const handleClearSearch = React.useCallback(() => setSearchTerm(""), [])

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header Sticky */}
            <header className="p-4 space-y-4 border-b bg-background/95 backdrop-blur-sm z-20">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0 rounded-lg hover:bg-accent"
                        onClick={() => navigate(-1)}
                        aria-label="Retour"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <h2 className="text-sm font-bold truncate leading-none">Classes</h2>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 h-8 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-8 justify-between px-2 text-[11px] border border-input/40 hover:bg-muted/30 transition-all"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <Layers className="size-3 text-muted-foreground" />
                                    {currentSectionLabel}
                                </span>
                                <ChevronDown className="size-3 opacity-50 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Sections</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={selectedSection} onValueChange={setSelectedSection}>
                                <DropdownMenuRadioItem value="all" className="text-xs">Toutes les sections</DropdownMenuRadioItem>
                                {SECTION_OPTIONS.map(opt => (
                                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                                        {opt.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Zone Scrollable */}
            <ScrollArea className="flex-1">
                <nav className="p-3 space-y-6">
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => (
                            <section key={group.section} className="space-y-1">
                                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 px-1">
                                    <span className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em]">
                                        {getSectionLabel(group.section as SECTION_ENUM)}
                                    </span>
                                </div>
                                <div className="grid gap-0.5">
                                    {group.data.map((classroom) => (
                                        <ClassroomNavItem
                                            key={classroom.classId}
                                            classroom={classroom}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center animate-in fade-in duration-300">
                            <BookX className="size-10 mb-2 stroke-[1]" />
                            <p className="text-xs font-bold uppercase tracking-tighter">Aucun résultat</p>
                        </div>
                    )}
                </nav>
            </ScrollArea>
        </div>
    )
}

ClassroomSidebar.displayName = "ClassroomSidebar"