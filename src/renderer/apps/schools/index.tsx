import { lazyNamed } from "@/renderer/utils/react";

export const TutorsPage = lazyNamed(
  () => import("@/renderer/apps/schools/screens/tutors"),
  "TutorsPage",
);
