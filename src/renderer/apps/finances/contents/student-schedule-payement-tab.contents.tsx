import {
  useGetFeeApplicableConfigurations,
  ApplicableFeeConfigParams,
} from "@/renderer/libs/queries/finances";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";

export type StudentSchdulePayementTabsProps = {
  params: ApplicableFeeConfigParams;
};
export const StudentSchdulePayementTabs: React.FC<
  StudentSchdulePayementTabsProps
> = ({ params }) => {
  const { data: applicableConfig } = useGetFeeApplicableConfigurations(params);
  return (
    <div>
      <Tabs defaultValue={applicableConfig[0]?.feeConfigId}>
        <TabsList>
          {applicableConfig.map((config) => (
            <TabsTrigger key={config.feeConfigId} value={config.feeConfigId}>
              {config.feeType?.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {applicableConfig.map((config) => (
          <TabsContent key={config.feeConfigId} value={config.feeConfigId}>
            <code>{JSON.stringify(config, null, 5)}</code>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
