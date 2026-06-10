import z from "zod";
import {
  seatingAssignmentRepository,
  seatingSessionService,
} from "@/packages/@core/data-access/db/queries/seatings";

import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  seatingGeneratorSchema,
  SchoolYearSchema,
  BulkSeatingAssignmentSchema,
  type TBulkSeatingAssignment,
  type SeatingGenerator,
  type SchoolYear,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "../abstract";
import { SeatingAssignmentRoutes } from "../../routes-constant";

/** Genere le mise en place */
export class GenerateSeating extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.GENERATING;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: seatingGeneratorSchema.merge(SchoolYearSchema),
  };
  protected handle({
    body,
  }: IpcRequest<SeatingGenerator & SchoolYear>): Promise<unknown> {
    return seatingSessionService.generate(body);
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
    return seatingAssignmentRepository.getRoomLayout(
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
    return seatingAssignmentRepository.bulkAssign(body);
  }
}

export class RebuildAssignments extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.RE_ASSIGNED;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: BulkSeatingAssignmentSchema,
  };
  protected handle({
    body: { sessionId, assignments },
  }: IpcRequest<TBulkSeatingAssignment>): Promise<unknown> {
    return seatingAssignmentRepository.rebuildAssignments(
      sessionId,
      assignments,
    );
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
    return seatingAssignmentRepository.getUnassignedStudents(
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
    const success = await seatingAssignmentRepository.clearRoomAssignments(
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
    return seatingAssignmentRepository.findStudentSeat(
      params.sessionId,
      params.enrolementId,
    );
  }
}
