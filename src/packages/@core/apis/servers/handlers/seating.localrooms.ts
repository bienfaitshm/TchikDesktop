import z from "zod";
import {
  localRoomRepository,
  localRoomService,
  type SelectOption,
} from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { LocalRoomRoutes } from "../../routes-constant";
import {
  LocalroomUpdateSchema,
  LocalroomFilterSchema,
  LocalroomCreateSchema,
  LocalroomSchema,
  type LocalroomCreate,
  type LocalroomUpdate,
  type LocalroomFilter,
  createSearchOptionsSchema,
} from "@/packages/@core/data-access/schema-validations";

const LocalRoomIdSchema = LocalroomSchema.pick({
  localroomId: true,
}).required();
type TLocalRoomIdSchema = z.infer<typeof LocalRoomIdSchema>;

export const searchLocalRoomSchema = createSearchOptionsSchema(
  LocalroomFilterSchema,
);
export type SearchLocalRoomParams = z.infer<typeof searchLocalRoomSchema>;

/** Récupère la liste des locaux filtrée (généralement par schoolId). */
export class GetLocalRooms extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: LocalroomFilterSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, LocalroomFilter>): Promise<unknown> {
    return localRoomRepository.findMany(params as any);
  }
}

export class GetSearchLocalRooms extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.SEARCH;
  method = HttpMethod.GET;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    params: searchLocalRoomSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, SearchLocalRoomParams>): Promise<SelectOption[]> {
    return localRoomService.getOptions(params as any);
  }
}

export class GetLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: LocalRoomIdSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TLocalRoomIdSchema>): Promise<unknown> {
    return localRoomRepository.findById(params.localroomId);
  }
}

/** Crée un nouveau local physique dans une école. */
export class CreateLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = { body: LocalroomCreateSchema };
  protected handle({ body }: IpcRequest<LocalroomCreate>): Promise<unknown> {
    return localRoomRepository.create(body);
  }
}

/** Met à jour les informations d'un local (capacité, nom, dimensions). */
export class UpdateLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: LocalRoomIdSchema,
    body: LocalroomUpdateSchema,
  };
  protected handle({
    params,
    body,
  }: IpcRequest<LocalroomUpdate, TLocalRoomIdSchema>): Promise<unknown> {
    return localRoomRepository.update(params.localroomId, body);
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
    return localRoomRepository.delete(params.localroomId);
  }
}
