import z from "zod";
import { localRoomService } from "@/packages/@core/data-access/db/queries/seating-queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { LocalRoomRoutes } from "../../routes-constant";
import {
  LocalRoomUpdateSchema,
  LocalRoomFilterSchema,
  LocalRoomCreateSchema,
  LocalRoomAttributesSchema,
  type TLocalRoomCreate,
  type TLocalRoomUpdate,
  type TLocalRoomFilter,
} from "@/packages/@core/data-access/schema-validations";

const LocalRoomIdSchema = LocalRoomAttributesSchema.pick({ localRoomId: true });
type TLocalRoomIdSchema = z.infer<typeof LocalRoomIdSchema>;

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

export class GetLocalRoom extends AbstractEndpoint<any> {
  route = LocalRoomRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = { params: LocalRoomIdSchema };
  protected handle({
    params,
  }: IpcRequest<unknown, TLocalRoomIdSchema>): Promise<unknown> {
    return localRoomService.findById(params.localRoomId);
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
