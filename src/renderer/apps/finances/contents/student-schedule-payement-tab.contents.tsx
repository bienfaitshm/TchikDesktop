import React, { useMemo } from "react";
import { useGetClassroomAssignmentTable } from "@/renderer/libs/queries/finances";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { FeeClassroomPayementTable } from "../tables/payment-table";
import { Wallet } from "lucide-react";
import { cn } from "@/renderer/utils";

export type StudentSchedulePaymentTabsProps = {
  schoolId: string;
  yearId: string;
  classId: string;
};

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
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-card">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
          <Wallet className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-1">
          Aucun frais applicable
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Aucune configuration de frais n'a été associée à cette salle de classe
          pour l'année scolaire en cours.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={defaultTabValue} className="w-full">
        {/* Barre d'onglets au design épuré */}
        <div className="border-b border-border pb-px mb-4">
          <TabsList className="h-10 p-0 bg-transparent gap-6 rounded-none border-b-0">
            {applicableConfig.map((config) => (
              <TabsTrigger
                key={config.feeTypeId}
                value={config.feeTypeId}
                className={cn(
                  // Base : fond transparent, pas de border, transition fluide du texte
                  "relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-1.5 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground",
                  // État Actif : La ligne apparaît ici, fine et élégante (style Vercel/Stripe)
                  "data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  // Reset complet des styles 'after' alternatifs de shadcn v4 pour éviter les doublons de lignes
                  "after:hidden",
                )}
              >
                {config.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Contenu des tableaux de paiement */}
        {applicableConfig.map((config) => (
          <TabsContent
            key={config.feeTypeId}
            value={config.feeTypeId}
            className="mt-0 outline-none focus-visible:ring-0"
          >
            <FeeClassroomPayementTable
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
