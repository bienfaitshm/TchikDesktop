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
import { AbstractEndpoint } from "../abstract";
import { documentExport } from "@/packages/@core/documents-exports";
import { DocumentExportRoutes } from "../../routes-constant";

export class GetInfosDocumentExports extends AbstractEndpoint<any> {
  route = DocumentExportRoutes.INFOS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: SchoolYearSchema,
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
    params: SchoolYearSchema,
  };

  protected async handle({
    body,
    params,
  }: IpcRequest<unknown, TSchoolYearSchemaAttibutes>): Promise<unknown> {
    const response = await documentExport.executeExport("", body);
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
