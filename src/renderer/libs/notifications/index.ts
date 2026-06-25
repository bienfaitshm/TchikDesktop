import { toast } from "sonner";
import { createMutationNotifier } from "./helper";

export const withNotifications = createMutationNotifier({
  success: (msg) => toast.success(msg.title, { description: msg.description }),
  error: (msg) => toast.error(msg.title, { description: msg.description }),
});
