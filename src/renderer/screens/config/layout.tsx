import { Outlet } from "react-router";
import { TypographyH2 } from "@/renderer/components/ui/typography"


export const LayoutConfigurationScreen: React.FC = () => {
    return (
        <div className="mx-auto max-w-screen-md h-screen flex items-center justify-center">
            <div className="container mx-auto">
                <TypographyH2>
                    Configuration
                </TypographyH2>
                <Outlet />
            </div>
        </div>
    )
}