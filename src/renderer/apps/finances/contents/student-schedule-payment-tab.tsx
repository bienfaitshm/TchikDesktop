import React, { useMemo } from "react";
import { Wallet } from "lucide-react";
import { useGetClassroomAssignmentTable } from "@/renderer/libs/queries/finances";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { FeeClassroomPaymentTable } from "../tables/payment-table";
import { cn } from "@/renderer/utils";
import { PaymentColorsLegend } from "../components/payment-legend-colors";

export type StudentSchedulePaymentTabsProps = {
  schoolId: string;
  yearId: string;
  classId: string;
};

/**
 * Renders an empty state view when no fee schedules are configured for a classroom.
 * @returns Rendered empty state UI component.
 */
export const EmptyFeeScheduleState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-card">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Wallet className="size-5" />
      </div>
      <h3 className="font-semibold text-base text-foreground mb-1">
        Aucun frais applicable
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs">
        Aucune configuration de frais n'a été associée à cette salle de classe
        pour l'année scolaire en cours.
      </p>
    </div>
  );
};

/**
 * Tabbed interface component rendering classroom fee assignment schedules.
 * @param props - Component properties containing class, school, and academic year IDs.
 * @returns Rendered tabbed payment tables or empty state component.
 */
export const StudentSchedulePaymentTabs: React.FC<
  StudentSchedulePaymentTabsProps
> = ({ classId, schoolId, yearId }) => {
  const { data: applicableConfig, queryKey } = useGetClassroomAssignmentTable({
    classId,
    schoolId,
    yearId,
  });

  const defaultTabValue = useMemo(() => {
    return applicableConfig?.[0]?.feeTypeId ?? "";
  }, [applicableConfig]);

  if (!applicableConfig || applicableConfig.length === 0) {
    return <EmptyFeeScheduleState />;
  }

  return (
    <div className="w-full flex-1 h-full flex flex-col gap-4">
      <Tabs defaultValue={defaultTabValue} className="w-full">
        <div className="sticky top-0 z-40 backdrop-blur-sm border-b border-border pb-px pt-2 transition-colors">
          <div className="flex items-center justify-between gap-4">
            <TabsList className="h-9 p-0 bg-transparent gap-4 rounded-none border-b-0 overflow-x-auto no-scrollbar">
              {applicableConfig.map((config) => (
                <TabsTrigger
                  key={config.feeTypeId}
                  value={config.feeTypeId}
                  className={cn(
                    "relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-3 pb-2 pt-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                    "data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "after:hidden",
                  )}
                >
                  {config.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="shrink-0 pb-1">
              <PaymentColorsLegend />
            </div>
          </div>
        </div>

        {applicableConfig.map((config) => (
          <TabsContent
            key={config.feeTypeId}
            value={config.feeTypeId}
            className="mt-4 outline-none focus-visible:ring-0"
          >
            <FeeClassroomPaymentTable
              schoolId={schoolId}
              yearId={yearId}
              mutationKey={queryKey}
              data={config.table}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
