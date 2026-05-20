import { useSuspenseQuery } from "@tanstack/react-query";
import { appInfos } from "@/renderer/libs/apis";

export function useGetSystemInfo() {
  return useSuspenseQuery({
    queryKey: ["GET_SYS_INFOS"],
    queryFn: () => appInfos.fetchSystemInfos(),
  });
}
