import { lazyNamed } from "@/renderer/utils/react";

export const LocalroomLayout = lazyNamed(
  () => import("@/renderer/apps/seatings/screens/localroom-layout"),
  "LocalRoomsLayout",
);
