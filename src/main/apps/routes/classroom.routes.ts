import { IPCApiRoutes } from "@/commons/constants/routes";
import { ipcServer } from "../config.ipc.server";
import * as handlers from "../handlers/classroom.handlers";

ipcServer.get(IPCApiRoutes.classrooms, handlers.getClassrooms);
ipcServer.get(IPCApiRoutes.classroom, handlers.getClassroom);
ipcServer.post(IPCApiRoutes.classrooms, handlers.updateClassroom);
ipcServer.delete(IPCApiRoutes.classroom, handlers.deleteClassroom);
ipcServer.put(IPCApiRoutes.classroom, handlers.updateClassroom);
