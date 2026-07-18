import {
  schoolRepository,
  studyYearRepository,
} from "@/packages/@core/data-access/db/queries";
import {
  SchoolSchema,
  StudyYearSchema,
  SchoolCreateSchema,
  SchoolUpdateSchema,
  SchoolFilterSchema,
  StudyYearCreateSchema,
  StudyYearUpdateSchema,
  StudyYearFilterSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { SchoolRoutes, StudyYearRoutes } from "../../routes-constant";

const SchoolIdSchema = SchoolSchema.pick({ schoolId: true });
const YearIdSchema = StudyYearSchema.pick({ yearId: true });

/**
 * Handles Inter-Process Communication (IPC) inbound requests for school metadata management.
 */
export class SchoolController {
  /**
   * Retrieves all school entities based on standard multi-criteria filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of filtered school records.
   */
  @IpcServer.register(HttpMethod.GET, SchoolRoutes.ALL, {
    params: SchoolFilterSchema,
  })
  static async getAll(req: IpcRequest) {
    return schoolRepository.findMany(req.params);
  }

  /**
   * provisions a new school entity record inside the core database structure.
   * @param req - The IPC request object containing the raw creation payload.
   * @returns A promise resolving to the newly created school record instance.
   */
  @IpcServer.register(HttpMethod.POST, SchoolRoutes.ALL, {
    body: SchoolCreateSchema,
  })
  static async create(req: IpcRequest) {
    return schoolRepository.create(req.body);
  }

  /**
   * Fetches specific structural school details using a primary identification token.
   * @param req - The IPC request object carrying target identification parameters.
   * @returns A promise resolving to the matched school object, or null.
   */
  @IpcServer.register(HttpMethod.GET, SchoolRoutes.DETAIL, {
    params: SchoolIdSchema,
  })
  static async getById(req: IpcRequest) {
    return schoolRepository.findById(req.params.schoolId);
  }

  /**
   * Updates fields on an existing institutional record designated by parameters.
   * @param req - The IPC request object containing update body payload and identification parameters.
   * @returns A promise resolving to the mutated school object record.
   */
  @IpcServer.register(HttpMethod.PUT, SchoolRoutes.DETAIL, {
    params: SchoolIdSchema,
    body: SchoolUpdateSchema,
  })
  static async update(req: IpcRequest) {
    return schoolRepository.update(req.body, req.params);
  }

  /**
   * Removes a targeted school entry definitively from persistent data storage tables.
   * @param req - The IPC request object carrying target tracking keys.
   * @returns A promise resolving to the operation completion status results.
   */
  @IpcServer.register(HttpMethod.DELETE, SchoolRoutes.DETAIL, {
    params: SchoolIdSchema,
  })
  static async delete(req: IpcRequest) {
    return schoolRepository.delete(req.params.schoolId);
  }
}

/**
 * Handles Inter-Process Communication (IPC) inbound requests for academic calendar study years.
 */
export class StudyYearController {
  /**
   * Retrieves all study years based on chronological query lookup parameters.
   * @param req - The IPC request object containing filter configurations.
   * @returns A promise resolving to an array of matching study years.
   */
  @IpcServer.register(HttpMethod.GET, StudyYearRoutes.ALL, {
    params: StudyYearFilterSchema,
  })
  static async getAll(req: IpcRequest) {
    return studyYearRepository.findMany(req.params);
  }

  /**
   * Instantiates a new study year timeline boundary within the application workspace.
   * @param req - The IPC request object carrying basic timeline initialization fields.
   * @returns A promise resolving to the initialized study year framework object.
   */
  @IpcServer.register(HttpMethod.POST, StudyYearRoutes.ALL, {
    body: StudyYearCreateSchema,
  })
  static async create(req: IpcRequest) {
    return studyYearRepository.create(req.body);
  }

  /**
   * Resolves comprehensive study year configurations via a primary identification tracking code.
   * @param req - The IPC request object holding target operational parameters.
   * @returns A promise resolving to the single targeted study year data structure.
   */
  @IpcServer.register(HttpMethod.GET, StudyYearRoutes.DETAIL, {
    params: YearIdSchema,
  })
  static async getById(req: IpcRequest) {
    return studyYearRepository.findById(req.params.yearId);
  }

  /**
   * Updates attributes on an active study year framework tracking reference.
   * @param req - The IPC request object containing specific change payload variables and identification parameters.
   * @returns A promise resolving to the mutated study year entity object.
   */
  @IpcServer.register(HttpMethod.PUT, StudyYearRoutes.DETAIL, {
    params: YearIdSchema,
    body: StudyYearUpdateSchema,
  })
  static async update(req: IpcRequest) {
    return studyYearRepository.update(req.body, req.params);
  }

  /**
   * Purges a designated study year timeline profile definitively from persistent storage tables.
   * @param req - The IPC request object carrying specific target constraints parameters.
   * @returns A promise resolving to the final terminal execution confirmation result.
   */
  @IpcServer.register(HttpMethod.DELETE, StudyYearRoutes.DETAIL, {
    params: YearIdSchema,
  })
  static async delete(req: IpcRequest) {
    return studyYearRepository.delete(req.params.yearId);
  }
}
