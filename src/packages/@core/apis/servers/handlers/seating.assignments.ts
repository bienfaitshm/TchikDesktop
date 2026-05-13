import z from "zod";
import {
  localRoomService,
  seatingAssignmentService,
} from "@/packages/@core/data-access/db/queries/seating-queries";
import { enrolementService } from "@/packages/@core/data-access/db/queries/enrolement.query";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { SeatingAssignmentRoutes } from "../../routes-constant";

import { SeatingService } from "../services/seating.service";

/** Genere le mise en place */

export class GenerateSeating extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.GENERATING;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: z.object({
      schoolId: z.string(),
      sessionId: z.string().optional(),
      yearId: z.string(),
    }),
  };
  protected handle({
    body: { schoolId, sessionId, yearId },
  }: IpcRequest<{
    sessionId: string;
    schoolId: string;
    yearId: string;
  }>): Promise<unknown> {
    const seating = new SeatingService(localRoomService, enrolementService);
    return seating.generate(schoolId, yearId, { sessionId });
  }
}

/** Récupère la disposition visuelle d'une salle avec les élèves à leurs places. */
export class GetRoomLayout extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.LAYOUT;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: z.object({
      sessionId: z.string(),
      localRoomId: z.string(),
    }),
  };
  protected handle({
    params,
  }: IpcRequest<
    unknown,
    { sessionId: string; localRoomId: string }
  >): Promise<unknown> {
    return seatingAssignmentService.getRoomLayout(
      params.sessionId,
      params.localRoomId,
    );
  }
}

/** Procède à l'assignation massive d'élèves à des places précises (Bulk Insert). */
export class BulkAssignStudents extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.BULK;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {};
  protected handle({ body }: IpcRequest<any>): Promise<unknown> {
    return seatingAssignmentService.bulkAssign(body);
  }
}

/** Liste les élèves inscrits qui n'ont pas encore de place pour cette session. */
export class GetUnassignedStudents extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.UNASSIGNED;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: z.object({
      sessionId: z.string(),
      yearId: z.string(),
    }),
  };
  protected handle({
    params,
  }: IpcRequest<
    unknown,
    { sessionId: string; yearId: string }
  >): Promise<unknown> {
    return seatingAssignmentService.getUnassignedStudents(
      params.sessionId,
      params.yearId,
    );
  }
}

/** Réinitialise (vide) toutes les places d'une salle spécifique pour une session. */
export class ClearRoomAssignments extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.CLEAR_ROOM;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    body: z.object({
      sessionId: z.string(),
      localRoomId: z.string(),
    }),
  };
  protected async handle({
    body,
  }: IpcRequest<{ sessionId: string; localRoomId: string }>): Promise<unknown> {
    const success = await seatingAssignmentService.clearRoomAssignments(
      body.sessionId,
      body.localRoomId,
    );
    return { success };
  }
}

/** Localise précisément la salle et la place d'un étudiant via son enrolementId. */
export class FindStudentSeat extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.FIND_STUDENT;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: z.object({
      sessionId: z.string(),
      enrolementId: z.string(),
    }),
  };
  protected handle({
    params,
  }: IpcRequest<
    unknown,
    { sessionId: string; enrolementId: string }
  >): Promise<unknown> {
    return seatingAssignmentService.findStudentSeat(
      params.sessionId,
      params.enrolementId,
    );
  }
}
