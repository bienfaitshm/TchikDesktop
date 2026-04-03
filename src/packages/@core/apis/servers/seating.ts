import z from "zod";
import {
  localRoomService,
  seatingAssignmentService,
  seatingSessionService,
} from "@/packages/@core/data-access/db/queries/seating.query";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "./abstract";
import {
  LocalRoomRoutes,
  SeatingAssignmentRoutes,
  SeatingSessionRoutes,
} from "../routes-constant";
import {
  LocalRoomCreateSchema,
  SeatingSessionCreateSchema,
} from "@/packages/@core/data-access/schema-validations";

const IdSchema = z.object({ id: z.string() });

// =============================================================================
// ENDPOINTS : LOCAL ROOMS (Salles Physiques)
// =============================================================================

export class GetLocalRooms extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: z.object({ schoolId: z.string() }) };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return localRoomService.findMany(params);
  }
}

export class CreateLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.CREATE;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = { body: LocalRoomCreateSchema };
  protected handle({ body }: IpcRequest<any>): Promise<unknown> {
    return localRoomService.create(body);
  }
}

export class UpdateLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.UPDATE;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: IdSchema,
    body: LocalRoomCreateSchema.partial(),
  };
  protected handle({ params, body }: IpcRequest<any>): Promise<unknown> {
    return localRoomService.update(params.id, body);
  }
}

export class DeleteLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.DELETE;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = { params: IdSchema };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return localRoomService.delete(params.id);
  }
}

// =============================================================================
// ENDPOINTS : SEATING SESSIONS (Sessions)
// =============================================================================

export class GetSessionsByYear extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.BY_YEAR;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: z.object({
      yearId: z.string(),
      schoolId: z.string().optional(),
    }),
  };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    // Note: schoolId peut provenir des query params ou du contexte
    return seatingSessionService.findByYear(params.schoolId!, params.yearId);
  }
}

export class CreateSeatingSession extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.CREATE;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = { body: SeatingSessionCreateSchema };
  protected handle({ body }: IpcRequest<any>): Promise<unknown> {
    return seatingSessionService.create(body);
  }
}

export class DeleteSeatingSession extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.DELETE;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = { params: IdSchema };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return seatingSessionService.delete(params.id);
  }
}

export class GetSessionRoomsStatus extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.STATUS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: IdSchema }; // id mappé sur :id dans la route
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return seatingSessionService.getSessionRoomsStatus(params.id);
  }
}

export class GetFullSessionDetails extends AbstractEndpoint<any> {
  route = SeatingSessionRoutes.FULL_DETAILS;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: IdSchema };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return seatingSessionService.getFullSessionDetails(params.id);
  }
}

// =============================================================================
// ENDPOINTS : SEATING ASSIGNMENTS (Placements)
// =============================================================================

export class GetRoomLayout extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.LAYOUT;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: z.object({
      sessionId: z.string(),
      localRoomId: z.string(),
    }),
  };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return seatingAssignmentService.getRoomLayout(
      params.sessionId,
      params.localRoomId,
    );
  }
}

export class BulkAssignStudents extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.BULK;
  method = HttpMethod.POST;
  protected handle({ body }: IpcRequest<any>): Promise<unknown> {
    return seatingAssignmentService.bulkAssign(body);
  }
}

export class GetUnassignedStudents extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.UNASSIGNED;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: z.object({
      sessionId: z.string(),
      yearId: z.string(),
    }),
  };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return seatingAssignmentService.getUnassignedStudents(
      params.sessionId,
      params.yearId,
    );
  }
}

export class ClearRoomAssignments extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.CLEAR_ROOM;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    body: z.object({
      sessionId: z.string(),
      localRoomId: z.string(),
    }),
  };
  protected async handle({ body }: IpcRequest<any>): Promise<unknown> {
    const success = await seatingAssignmentService.clearRoomAssignments(
      body.sessionId,
      body.localRoomId,
    );
    return { success };
  }
}

/**
 * Recherche la position d'un étudiant (Nouveau)
 */
export class FindStudentSeat extends AbstractEndpoint<any> {
  route = SeatingAssignmentRoutes.FIND_STUDENT;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: z.object({
      sessionId: z.string(),
      enrolementId: z.string(),
    }),
  };
  protected handle({ params }: IpcRequest<any>): Promise<unknown> {
    return seatingAssignmentService.findStudentSeat(
      params.sessionId,
      params.enrolementId,
    );
  }
}
