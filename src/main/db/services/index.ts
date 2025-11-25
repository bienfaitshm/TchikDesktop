import { AppDataSystem } from "./data-system";

import * as classooms from "./handlers/classroom.handlers";
import { BaseQueryHandler } from "./handlers/handler";

/**
 * 📦 Liste déclarative de tous les Data Handlers enregistrés dans l'application.
 * Cette liste sert de manifeste pour le AppDataSystem.
 */

const HANDLERS_MANIFEST: BaseQueryHandler[] = [];

export const appDataSystem = new AppDataSystem(HANDLERS_MANIFEST);
