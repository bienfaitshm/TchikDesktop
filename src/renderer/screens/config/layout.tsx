import React from "react";
import { Outlet } from "react-router";
import { TypographyH2 } from "@/renderer/components/ui/typography";
import { Cog } from "lucide-react";


export const ConfigurationLayoutScreen: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 ">
            <div className="container mx-auto max-w-screen-md space-y-8 p-6">
                <div className="flex items-center gap-4 border-b pb-4 border-neutral-200 dark:border-neutral-700">
                    <Cog className="size-10 text-neutral-600 dark:text-neutral-400 animate-spin-slow" />
                    <TypographyH2 className="mb-0 pb-0 text-gray-800 dark:text-gray-100">
                        Configuration Requise
                    </TypographyH2>
                </div>
                <div className="py-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};