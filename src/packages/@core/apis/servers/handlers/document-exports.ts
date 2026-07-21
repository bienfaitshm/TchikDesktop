import { z } from "zod";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
  HttpException,
  HttpStatus,
} from "@/packages/electron-ipc-rest";
import {
  schoolYearIdBaseSchema,
  type SchoolYearIdBase,
} from "@/packages/@core/data-access/schema-validations";
import { documentExport } from "@/packages/@core/documents-exports";
import { DocumentExportRoutes } from "../../routes-constant";

export const defaultDocumentExportSchema = z.object({
  documentType: z.string().min(1),
  data: z.record(z.unknown()),
});

export type DocumentExportFormData = z.infer<
  typeof defaultDocumentExportSchema
>;

/**
 * Handles Inter-Process Communication (IPC) inbound requests for document generation and configuration metadata.
 */
export class DocumentExportController {
  /**
   * Retrieves available document export definitions for a specified school year.
   * @param req - The IPC request context containing school year reference parameters.
   * @returns A promise resolving to the metadata layout of available document configurations.
   */
  @IpcServer.register(HttpMethod.GET, DocumentExportRoutes.INFOS, {
    params: schoolYearIdBaseSchema.passthrough(),
  })
  static async getInfos(req: IpcRequest<unknown, SchoolYearIdBase>) {
    return documentExport.getAvailableExports(req.params);
  }

  /**
   * Initiates the document compilation and rendering process workflow.
   * @param req - The IPC request context holding generation payload definitions and scope constraints.
   * @returns A promise resolving to the processed operational completion payload.
   * @throws {HttpException} If the business layer generation pipeline encounters downstream processing failure.
   */
  @IpcServer.register(HttpMethod.POST, DocumentExportRoutes.EXPORTS, {
    params: schoolYearIdBaseSchema.passthrough(),
    body: defaultDocumentExportSchema,
  })
  static async export(
    req: IpcRequest<DocumentExportFormData, SchoolYearIdBase>,
  ) {
    const { documentType, data } = req.body;
    const { schoolId, yearId } = req.params;

    const response = await documentExport.executeExport(documentType, {
      ...data,
      schoolId,
      yearId,
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
