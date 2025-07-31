import {
    Frame,
    Map,
    PieChart,
    Home,
    type LucideIcon, // Import LucideIcon type for better typing
} from "lucide-react";
import { NavLink } from "react-router";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/renderer/components/ui/sidebar";
import { SidebarHead } from "./app-sidebar.head";
import { SidebarFoot } from "./app-sidebar.foot";

/**
 * @interface UserProfile
 * @description Represents the structure of user profile data.
 * @property {string} name - The user's name.
 * @property {string} email - The user's email address.
 * @property {string} avatar - URL to the user's avatar image.
 */
interface UserProfile {
    name: string;
    email: string;
    avatar: string;
}

/**
 * @interface NavItem
 * @description Represents a single navigation item in the sidebar.
 * @property {string} name - The display name of the navigation item.
 * @property {string} url - The URL path for the navigation item.
 * @property {LucideIcon} icon - The Lucide React icon component to display next to the item.
 */
interface NavItem {
    name: string;
    url: string;
    icon: LucideIcon;
}

/**
 * @interface SidebarData
 * @description Defines the structure of the data used to populate the application sidebar.
 * @property {UserProfile} user - User profile information for the sidebar footer.
 * @property {NavItem[]} applications - List of navigation items for the "Applications" section.
 * @property {NavItem[]} school - List of navigation items for the "School" related section.
 * @property {NavItem[]} others - List of navigation items for the "Other" section.
 */
interface SidebarData {
    user: UserProfile;
    applications: NavItem[];
    school: NavItem[];
    others: NavItem[];
}

/**
 * @constant APP_SIDEBAR_NAVIGATION_DATA
 * @description Static data defining the structure and content of the application's main sidebar navigation.
 */
const APP_SIDEBAR_NAVIGATION_DATA: SidebarData = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    applications: [
        {
            name: "Accueil",
            url: "/",
            icon: Home,
        },
        {
            name: "Inscriptions",
            url: "/inscriptions",
            icon: Frame,
        },
        {
            name: "Mise en place",
            url: "/mise-en-places",
            icon: Map,
        },
    ],
    school: [
        {
            name: "Élèves",
            url: "/students",
            icon: Frame,
        },
        {
            name: "Options",
            url: "/options",
            icon: PieChart,
        },
        {
            name: "Classes",
            url: "/classrooms",
            icon: Map,
        },
        {
            name: "Locaux",
            url: "/locals",
            icon: Map,
        },
    ],
    others: [
        {
            name: "Années scolaires",
            url: "/school-years",
            icon: Frame,
        },
    ],
};

/**
 * @component ApplicationSidebar
 * @description Renders the main application sidebar, providing navigation links
 * grouped into logical sections. It uses custom sidebar components (e.g., `Sidebar`,
 * `SidebarGroup`, `SidebarMenuItem`) and integrates with `react-router-dom` for navigation.
 * The sidebar is designed to be collapsible.
 * @returns {JSX.Element} The rendered application sidebar.
 *
 * @example
 * // This component would typically be used in your main application layout:
 * ```tsx
 * import { ApplicationSidebar } from "@/path/to/this/file";
 * import { Outlet } from "react-router-dom";
 *
 * function AppLayout() {
 * return (
 * <div className="flex h-screen">
 * <ApplicationSidebar />
 * <main className="flex-1 overflow-auto p-4">
 * <Outlet /> // Renders the matched route component
 * </main>
 * </div>
 * );
 * }
 * ```
 */
export function ApplicationSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarHead />
            </SidebarHeader>
            <SidebarContent>
                {/* Applications Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {APP_SIDEBAR_NAVIGATION_DATA.applications.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* School Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Écoles</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {APP_SIDEBAR_NAVIGATION_DATA.school.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Others Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Autres</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {APP_SIDEBAR_NAVIGATION_DATA.others.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarFoot user={APP_SIDEBAR_NAVIGATION_DATA.user} />
            </SidebarFooter>
        </Sidebar>
    );
}