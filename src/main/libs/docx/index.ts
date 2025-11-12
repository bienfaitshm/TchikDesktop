import type {
  TClassroom,
  TSchool,
  TUser,
  TEnrolement,
} from "@/commons/types/models";
import { generateDocxReport, resolveTemplatePath } from "./config";
import { DOCUMENT_NAME } from "./constants";

export type CotationData = {
  school: TSchool;
  classrooms: (TClassroom & { students: (TUser & TEnrolement)[] })[];
};

export async function generateContationDocument(data: CotationData) {
  const document = await generateDocxReport(
    resolveTemplatePath(DOCUMENT_NAME.contationSecondary),
    data
  );
  return document;
}

export async function generateEnrollementDocument(data: CotationData) {
  console.log(JSON.stringify(data, null, 4));
  const document = await generateDocxReport(
    resolveTemplatePath(DOCUMENT_NAME.enrollementStudent),
    data
  );
  return document;
}
