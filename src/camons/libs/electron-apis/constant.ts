export const Methods = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export const Status = {
  // Success
  OK: 200,
  CREATED: 201,
  NOT_CONTENT: 204,
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDEN: 403,
  NOT_FOUND: 404,
  // Server Errors
  INTERNAL_SERVER: 500,
  BAD_GETAWAY: 502,
  GETAWAY_TIMEOUT: 504,
} as const;

export const SuccessStatus: number[] = [
  Status.OK,
  Status.CREATED,
  Status.NOT_CONTENT,
] as const;
