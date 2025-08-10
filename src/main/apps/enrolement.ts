import type {
  QuickEnrolementAttributesInsert,
  WithSchoolAndYearId,
} from "@/camons/types/services";
import { server } from "@/camons/libs/electron-apis/server";
import { response } from "@/camons/libs/electron-apis/utils";
// import { Status } from "@/camons/libs/electron-apis/constant";
import { mapModelsToPlainList, mapModelToPlain } from "@/main/db/models/utils";
import { STUDENT_STATUS } from "@/camons/constants/enum";
import { UserService, ClassroomEnrolementService } from "@/main/db/services";
import { getDefaultEnrolementCode } from "@/main/db/services/utils";

const DEFAULT_STUDENT_PASSWORD = "000000";

server.post<any, QuickEnrolementAttributesInsert>(
  "enrolements/quick",
  async ({ data }) => {
    const { student: studentData, ...enrolementData } = data;
    // generics/ default data
    const enrolementCode = getDefaultEnrolementCode();

    //   create -student
    const student = await UserService.create({
      ...studentData,
      password: DEFAULT_STUDENT_PASSWORD,
      schoolId: enrolementData.schoolId,
    });

    // create -enrolement
    const enrolement = await mapModelToPlain(
      ClassroomEnrolementService.create({
        ...enrolementData,
        code: enrolementCode,
        status: STUDENT_STATUS.EN_COURS,
        studentId: student.userId,
      })
    );

    return response(enrolement);
  }
);

server.get<any, WithSchoolAndYearId>(
  "enrolements",
  async ({ params: { schoolId } }) => {
    return response(
      mapModelsToPlainList(ClassroomEnrolementService.findAll(schoolId))
    );
  }
);

server.post("enrolements", async () => {
  return response({});
});

server.delete("enrolements", async () => {
  return response({});
});
