import z from "zod";
import { seatingSessionService } from "@/packages/@core/data-access/db/queries/seating.query";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  SeatingSessionAttributesSchema,
  SeatingSessionCreateSchema,
  SchoolYearSchema,
  type TSeatingSessionCreate,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "../abstract";
import { SeatingSessionRoutes } from "../../routes-constant";

const SchoolIdYearIdSchemas = SchoolYearSchema;
type TSchoolIdYearId = z.infer<typeof SchoolIdYearIdSchemas>;

const SeatingSessionIdSchema = SeatingSessionAttributesSchema.pick({
  sessionId: true,
});
type TSeatingSessionIdSchema = z.infer<typeof SeatingSessionIdSchema>;

/** Récupère toutes les sessions de placement pour une année scolaire donnée. */
export class GetSeatingSessionsByYear extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.BY_YEAR;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: SchoolIdYearIdSchemas };
  protected handle({
    params,
  }: IpcRequest<unknown, TSchoolIdYearId>): Promise<unknown> {
    return seatingSessionService.findByYear(params.schoolId!, params.yearId!);
  }
}

/** Récupère les détails complets d'une session avec les élèves assignés. */
export class GetFullSessionDetails extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.FULL_DETAILS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: SeatingSessionIdSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TSeatingSessionIdSchema>): Promise<unknown> {
    return seatingSessionService.getFullSessionDetails(params.sessionId);
  }
}

/** Initialise une nouvelle session de placement (ex: Examen Semestre 1). */
export class CreateSeatingSession extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.CREATE;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = { body: SeatingSessionCreateSchema };
  protected handle({
    body,
  }: IpcRequest<TSeatingSessionCreate>): Promise<unknown> {
    return seatingSessionService.create(body);
  }
}

export class UpdateSeatingSession extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: SeatingSessionIdSchema,
    body: SeatingSessionCreateSchema,
  };
  protected handle({
    params: { sessionId },
    body,
  }: IpcRequest<
    TSeatingSessionCreate,
    TSeatingSessionIdSchema
  >): Promise<unknown> {
    return seatingSessionService.update(sessionId, body);
  }
}

/** Supprime une session et potentiellement les assignations liées. */
export class DeleteSeatingSession extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = { params: SeatingSessionIdSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TSeatingSessionIdSchema>): Promise<unknown> {
    return seatingSessionService.delete(params.sessionId);
  }
}

/** Retourne l'état de remplissage (comptage/pourcentage) des locaux pour une session. */
export class GetSessionRoomsStatus extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.STATUS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: SeatingSessionIdSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TSeatingSessionIdSchema>): Promise<unknown> {
    return seatingSessionService.getSessionRoomsStatus(params.sessionId);
  }
}
