import type {
  QuickEnrolementAttributesInsert,
  ClassroomEnrolementAttributes,
} from "@/camons/types/services";
import { clientApis } from "./client";

export const getEnrolements = (schoolId: string, yearId?: string) => {
  return clientApis
    .get<ClassroomEnrolementAttributes[]>("enrolements", {
      params: { schoolId, yearId },
    })
    .then((res) => res.data);
};

export const quickEnrolement = (data: QuickEnrolementAttributesInsert) => {
  return clientApis
    .post<
      ClassroomEnrolementAttributes,
      QuickEnrolementAttributesInsert
    >("enrolements/quick", data)
    .then((res) => res.data);
};
