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
import { AbstractEndpoint } from "../abstract";
import {
  LocalRoomRoutes,
  SeatingAssignmentRoutes,
  SeatingSessionRoutes,
} from "../../routes-constant";
import {
  LocalRoomUpdateSchema,
  LocalRoomFilterSchema,
  LocalRoomCreateSchema,
  LocalRoomAttributesSchema,
  SeatingSessionAttributesSchema,
  SeatingSessionCreateSchema,
  SeatingSessionUpdateSchema,
  SeatingSessionFilterSchema,
  type TLocalRoomCreate,
  type TLocalRoomUpdate,
  type TLocalRoomFilter,
  type TSeatingSessionCreate,
  type TSeatingSessionUpdate,
  type TSeatingSessionFilter,
} from "@/packages/@core/data-access/schema-validations";

const SchoolIdYearIdSchemas = SeatingSessionAttributesSchema.pick({
  schoolId: true,
  yearId: true,
});
type TSchoolIdYearId = z.infer<typeof SchoolIdYearIdSchemas>;

const LocalRoomIdSchema = LocalRoomAttributesSchema.pick({ localRoomId: true });
type TLocalRoomIdSchema = z.infer<typeof LocalRoomIdSchema>;

const SeatingSessionIdSchema = SeatingSessionAttributesSchema.pick({
  sessionId: true,
});
type TSeatingSessionIdSchema = z.infer<typeof SeatingSessionIdSchema>;

// =============================================================================
// ENDPOINTS : LOCAL ROOMS (Salles Physiques)
// =============================================================================

/** Récupère la liste des locaux filtrée (généralement par schoolId). */
export class GetLocalRooms extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: LocalRoomFilterSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TLocalRoomFilter>): Promise<unknown> {
    return localRoomService.findMany(params as any);
  }
}

/** Crée un nouveau local physique dans une école. */
export class CreateLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = { body: LocalRoomCreateSchema };
  protected handle({ body }: IpcRequest<TLocalRoomCreate>): Promise<unknown> {
    return localRoomService.create(body);
  }
}

/** Met à jour les informations d'un local (capacité, nom, dimensions). */
export class UpdateLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: LocalRoomIdSchema,
    body: LocalRoomUpdateSchema,
  };
  protected handle({
    params,
    body,
  }: IpcRequest<TLocalRoomUpdate, TLocalRoomIdSchema>): Promise<unknown> {
    return localRoomService.update(params.localRoomId, body);
  }
}

/** Supprime un local de la base de données. */
export class DeleteLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = { params: LocalRoomIdSchema };
  protected handle({
    params,
  }: IpcRequest<undefined, TLocalRoomIdSchema>): Promise<unknown> {
    return localRoomService.delete(params.localRoomId);
  }
}

// =============================================================================
// ENDPOINTS : SEATING SESSIONS (Sessions)
// =============================================================================

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

// =============================================================================
// ENDPOINTS : SEATING ASSIGNMENTS (Placements)
// =============================================================================

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
