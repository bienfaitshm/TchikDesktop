import { clientApis } from "./client";

export const getConfiguration = () => {
  return clientApis.get("configuration");
};

export const createConfiguration = (value: { name: string }) => {
  return clientApis.post("configuration", value);
};
