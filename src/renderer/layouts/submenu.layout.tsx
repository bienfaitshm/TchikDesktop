import { Outlet } from "react-router";
import {
  SubNavigationLayout,
  NavItem,
  SubNavContentFallback,
} from "@/components/sidebars";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";

export type SubNavLayoutProps = {
  navItems?: NavItem[];
};
export function SubNavLayout({ navItems = [] }: SubNavLayoutProps) {
  const { schoolId, yearId } = useSchoolContext();

  return (
    <SubNavigationLayout items={navItems}>
      <Suspense fallback={<SubNavContentFallback />}>
        <Outlet context={{ schoolId, yearId }} />
      </Suspense>
    </SubNavigationLayout>
  );
}
