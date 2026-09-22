import { toast } from "sonner";
import { createMutationNotifier } from "./helper";
import type { Notifier } from "./types";

export const notifier: Notifier = {
  success: (msg) => toast.success(msg.title, { description: msg.description }),
  error: (msg) => toast.error(msg.title, { description: msg.description }),
};

export const withNotifications = createMutationNotifier(notifier);
