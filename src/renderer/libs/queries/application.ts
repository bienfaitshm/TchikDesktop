import { useSuspenseQuery } from "@tanstack/react-query";
import { getSystemInfos } from "@/renderer/libs/apis/application";

export function useGetSystemInfo() {
  return useSuspenseQuery({
    queryKey: ["GET_SYS_INFOS"],
    queryFn: () => getSystemInfos(),
  });
}
