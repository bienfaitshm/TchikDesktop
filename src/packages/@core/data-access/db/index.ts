import { sequelize } from "./config";
import { setupAssociations } from "./models/associations";

import "./models/identity.models";
import "./models/academic.models";
import "./models/seating.models";

// Initialise les relations
setupAssociations();

export { sequelize };
export * from "./models/identity.models";
export * from "./models/academic.models";
export * from "./models/seating.models";
export * from "./models/types";
