import z from "zod";
import { seatingSessionRepository } from "@/packages/@core/data-access/db/queries/seatings";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  SeatingSessionSchema,
  SeatingSessionCreateSchema,
  SeatingSessionFilterSchema,
  type SeatingSessionFilter,
  type SeatingSessionCreate,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "../abstract";
import { SeatingSessionRoutes } from "../../routes-constant";

const SeatingSessionIdSchema = SeatingSessionSchema.pick({
  sessionId: true,
});
type TSeatingSessionIdSchema = z.infer<typeof SeatingSessionIdSchema>;

export class GetSeatingSessions extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: SeatingSessionFilterSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, SeatingSessionFilter>): Promise<unknown> {
    return seatingSessionRepository.findMany(params as any);
  }
}

export class GetSeatingSession extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: SeatingSessionIdSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TSeatingSessionIdSchema>): Promise<unknown> {
    return seatingSessionRepository.findById(params.sessionId);
  }
}

/** Récupère les détails complets d'une session avec les élèves assignés. */
export class GetSessionWithAssignments extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.FULL_DETAILS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: SeatingSessionIdSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TSeatingSessionIdSchema>): Promise<unknown> {
    return seatingSessionRepository.getSessionWithAssignments(params.sessionId);
  }
}

/** Initialise une nouvelle session de placement (ex: Examen Semestre 1). */
export class PostSeatingSession extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = { body: SeatingSessionCreateSchema };
  protected handle({
    body,
  }: IpcRequest<SeatingSessionCreate>): Promise<unknown> {
    return seatingSessionRepository.create(body);
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
    SeatingSessionCreate,
    TSeatingSessionIdSchema
  >): Promise<unknown> {
    return seatingSessionRepository.update(sessionId, body);
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
    return seatingSessionRepository.delete(params.sessionId);
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
    return seatingSessionRepository.getSessionRoomsStatus(params.sessionId);
  }
}
