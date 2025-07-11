import { clientApis } from "./client";

export const getConfiguration = () => {
  return clientApis.get("configuration");
};

export const createConfiguration = (title: string) => {
  return clientApis.post("configuration", { title });
};
