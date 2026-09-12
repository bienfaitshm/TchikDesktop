import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetFeeAssignments } from "@/renderer/libs/queries/finances";
import { groupFeeAssignmentsByTypeName } from "@/renderer/libs/queries/finances/utils";
import { formatCurrency } from "@/packages/currency";
import { getFeeScheduleLabel } from "@/packages/@core/data-access/db/options";

export type FeeAssignmentTabProps = {
  enrollmentId: string;
};

export const FeeAssignmentTab: React.FC<FeeAssignmentTabProps> = ({
  enrollmentId,
}) => {
  const { data: assignments = [] } = useGetFeeAssignments({
    where: { feeAssignments: { enrollmentId } },
    orderBy: [{ table: "feeSchedules", column: "createdAt", order: "asc" }],
  });

  const grouped = groupFeeAssignmentsByTypeName(assignments);

  return (
    <Tabs defaultValue={grouped[0]?.heading} className="w-full">
      {/* Tabs arrondis style Google */}
      <TabsList className="bg-transparent gap-2">
        {grouped.map((item) => (
          <TabsTrigger
            key={item.heading}
            value={item.heading!}
            className="text-xs px-3 py-4 rounded-full data-active:bg-primary data-active:text-primary-foreground dark:data-active:border-none dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            {item.heading}
          </TabsTrigger>
        ))}
      </TabsList>

      {grouped.map((item) => (
        <TabsContent
          key={item.heading}
          value={item.heading!}
          className="mt-2 focus-visible:outline-none"
        >
          {/* Grille responsive façon Google Material */}
          <div className="flex flex-row items-center gap-4">
            {item.options.map((ass) => (
              <div
                key={ass.assignmentId}
                className="bg-card rounded-md flex flex-col"
              >
                {/* Header : nom de l'installment */}
                <div className="flex items-center justify-center gap-2.5 bg-primary px-2 py-1 rounded-t-md">
                  <span className="text-[10px] font-medium text-primary-foreground text-center">
                    {ass.feeSchedule.installmentName}
                  </span>
                </div>

                {/* Montant */}
                <div className="px-2 py-1 flex flex-col">
                  <span className="text-[10px] font-semibold">
                    {formatCurrency(ass.amountPaid, ass.currency)}
                  </span>
                  <span className="text-[9px] truncate">
                    {getFeeScheduleLabel(ass.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
