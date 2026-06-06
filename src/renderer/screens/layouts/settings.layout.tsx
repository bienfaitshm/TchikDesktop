"use client";

import { Outlet, useLocation, Link } from "react-router";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/renderer/components/ui/resizable";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "./page-shell.layout";
import { cn } from "@/renderer/utils";
import { 
    User, 
    Settings2, 
    Bell, 
    LifeBuoy, 
    Info, 
    Code2 
} from "lucide-react";

/**
 * Configuration des items du menu (doit correspondre à tes routes)
 */
const NAV_ITEMS = [
    { title: "Mon compte", href: "/settings/account", icon: User },
    { title: "Paramètres généraux", href: "/settings", icon: Settings2 },
    { title: "Notifications", href: "/settings/notifications", icon: Bell },
    { title: "Aide & Support", href: "/settings/help", icon: LifeBuoy },
    { title: "À propos", href: "/settings/about", icon: Info },
    { title: "Mode développeur", href: "/settings/developer", icon: Code2 },
];

export const SettingLayout = () => {
    const { schoolId, yearId } = useSchoolContext();
    const { pathname } = useLocation();

    const activeTitle = NAV_ITEMS.find(item => item.href === pathname)?.title || "Paramètres";

    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden border-t">
            <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                {/* PANNEAU LATÉRAL : NAVIGATION */}
                <ResizablePanel
                    defaultSize={20}
                    minSize={15}
                    maxSize={25}
                    className="h-full bg-muted/30 backdrop-blur-xs"
                >
                    <div className="flex flex-col h-full">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold tracking-tight">Réglages</h2>
                            <p className="text-xs text-muted-foreground">Gérez vos préférences système</p>
                        </div>
                        
                        <nav className="flex-1 px-3 space-y-1">
                            <Suspense fallback={<SidebarSkeleton />}>
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                isActive 
                                                    ? "bg-background shadow-xs text-primary ring-1 ring-border" 
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className={cn("size-4", isActive ? "text-primary" : "opacity-70")} />
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </Suspense>
                        </nav>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-border/50" />

                {/* PANNEAU PRINCIPAL : CONTENU */}
                <ResizablePanel defaultSize={80}>
                    <PageShell
                        maxWidth="2xl"
                        header={
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-bold tracking-tight">{activeTitle}</h1>
                                <div className="h-1 w-10 bg-primary rounded-full" />
                            </div>
                        }
                    >
                        <div className="py-6">
                            <Outlet context={{ schoolId, yearId }} />
                        </div>
                    </PageShell>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

/**
 * Skeleton pour le chargement du menu
 */
const SidebarSkeleton = () => (
    <div className="space-y-2 px-1">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-full bg-muted/60 animate-pulse rounded-md" />
        ))}
    </div>
);