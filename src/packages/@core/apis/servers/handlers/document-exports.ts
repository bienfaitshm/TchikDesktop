import { z } from "zod";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
  HttpException,
  HttpStatus,
} from "@/packages/electron-ipc-rest";
import {
  SchoolYearSchema,
  type TSchoolYearSchemaAttibutes,
} from "@/packages/@core/data-access/schema-validations";
import { documentExport } from "@/packages/@core/documents-exports";
import { AbstractEndpoint } from "../abstract";
import { DocumentExportRoutes } from "../../routes-constant";

export const defaultDocumentExportSchema = z.object({
  documentType: z.string().min(1),
  data: z.record(z.unknown()),
});

export type DocumentExportFormData = z.infer<
  typeof defaultDocumentExportSchema
>;

export class GetInfosDocumentExports extends AbstractEndpoint<any> {
  route = DocumentExportRoutes.INFOS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: SchoolYearSchema.passthrough(),
  };

  protected async handle({
    params,
  }: IpcRequest<unknown, TSchoolYearSchemaAttibutes>): Promise<unknown> {
    return documentExport.getAvailableExports(params);
  }
}

export class ExportDocuments extends AbstractEndpoint<any> {
  route = DocumentExportRoutes.EXPORTS;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    params: SchoolYearSchema.passthrough(),
  };

  protected async handle({
    body: { documentType, data },
    params,
  }: IpcRequest<
    DocumentExportFormData,
    TSchoolYearSchemaAttibutes
  >): Promise<unknown> {
    const response = await documentExport.executeExport(documentType, {
      ...data,
      schoolId: params.schoolId,
      yearId: params.yearId,
    });
    if (!response.success) {
      throw new HttpException(
        response.error.message,
        HttpStatus.BAD_REQUEST,
        response.error.details,
      );
    }
    return response;
  }
}
