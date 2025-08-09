import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type {
  QuickEnrolementAttributesInsert,
  ClassroomEnrolementAttributes,
  WithSchoolAndYearId,
} from "@/camons/types/services";
import * as apis from "@/renderer/libs/apis/enrolement";

export function useGetEnrolements({
  schoolId,
  yearId,
}: WithSchoolAndYearId<{}>) {
  return useSuspenseQuery<ClassroomEnrolementAttributes[], Error>({
    queryKey: ["GET_ENROLEMENT"],
    queryFn: () => apis.getEnrolements(schoolId, yearId),
  });
}

export function useQuickEnrolement() {
  return useMutation<
    ClassroomEnrolementAttributes,
    Error,
    QuickEnrolementAttributesInsert
  >({
    mutationKey: ["QUICK_ENROLEMENT"],
    mutationFn: (data) => apis.quickEnrolement(data),
  });
}
