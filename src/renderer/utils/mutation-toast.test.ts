import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { withNotifications, DEFAULT_MUTATION_MESSAGES } from "./mutation-toast";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("withNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Success Handling", () => {
    it("should trigger default success toast on successful mutation", () => {
      const options = withNotifications();
      const mockData = { id: 1 };
      const mockVariables = { name: "test" };

      options.onSuccess?.(
        mockData,
        mockVariables,
        undefined as any,
        undefined as any,
      );

      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(
        DEFAULT_MUTATION_MESSAGES.successTitle,
        { description: DEFAULT_MUTATION_MESSAGES.successDescription },
      );
    });

    it("should trigger custom success toast when custom messages are provided", () => {
      const options = withNotifications({
        successMessageTitle: "Custom Success",
        successMessageDescription: "Custom Success Description",
      });

      options.onSuccess?.({}, {}, undefined as any, undefined as any);

      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("Custom Success", {
        description: "Custom Success Description",
      });
    });

    it("should not trigger success toast when showSuccessNotification is false", () => {
      const options = withNotifications({ showSuccessNotification: false });

      options.onSuccess?.({}, {}, undefined as any, undefined as any);

      expect(toast.success).not.toHaveBeenCalled();
    });

    it("should execute existing user onSuccess callback alongside notification", () => {
      const userOnSuccess = vi.fn();
      const options = withNotifications({ onSuccess: userOnSuccess });
      const mockData = { id: 42 };

      options.onSuccess?.(mockData, {}, undefined as any, undefined as any);

      expect(userOnSuccess).toHaveBeenCalledTimes(1);
      expect(userOnSuccess).toHaveBeenCalledWith(
        mockData,
        {},
        undefined as any,
        undefined as any,
      );
      expect(toast.success).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    it("should trigger default error toast with Error instance message", () => {
      const options = withNotifications();
      const error = new Error("Database connection failed");

      options.onError?.(error, {}, undefined as any, undefined as any);

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        DEFAULT_MUTATION_MESSAGES.errorTitle,
        { description: "Database connection failed" },
      );
    });

    it("should handle non-Error exceptions by converting them to string", () => {
      const options = withNotifications();
      const error = "Critical Failure";

      options.onError?.(error, {}, undefined as any, undefined as any);

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        DEFAULT_MUTATION_MESSAGES.errorTitle,
        { description: "Critical Failure" },
      );
    });

    it("should use custom error messages when provided", () => {
      const options = withNotifications({
        errorMessageTitle: "Custom Error Title",
        errorMessageDescription: "Custom Error Description",
      });
      const error = new Error("Ignored error");

      options.onError?.(error, {}, undefined as any, undefined as any);

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("Custom Error Title", {
        description: "Custom Error Description",
      });
    });

    it("should not trigger error toast when showErrorNotification is false", () => {
      const options = withNotifications({ showErrorNotification: false });
      const error = new Error("Failed");

      options.onError?.(error, {}, undefined as any, undefined as any);

      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should execute existing user onError callback alongside notification", () => {
      const userOnError = vi.fn();
      const options = withNotifications({ onError: userOnError });
      const error = new Error("Failed");

      options.onError?.(error, {}, undefined as any, undefined as any);

      expect(userOnError).toHaveBeenCalledTimes(1);
      expect(userOnError).toHaveBeenCalledWith(
        error,
        {},
        undefined as any,
        undefined as any,
      );
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });

  describe("Settled Handling", () => {
    it("should execute existing user onSettled callback correctly", () => {
      const userOnSettled = vi.fn();
      const options = withNotifications({ onSettled: userOnSettled });
      const mockData = { id: 1 };
      const error = null;

      options.onSettled?.(
        mockData,
        error,
        {},
        undefined as any,
        undefined as any,
      );

      expect(userOnSettled).toHaveBeenCalledTimes(1);
      expect(userOnSettled).toHaveBeenCalledWith(
        mockData,
        error,
        {},
        undefined as any,
        undefined as any,
      );
    });
  });
});
