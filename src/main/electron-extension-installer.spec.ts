import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  setupDevelopmentEnvironment,
  type ILogger,
} from "./electron-extension-installer";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { is } from "@electron-toolkit/utils";

vi.mock("electron-devtools-installer", () => ({
  default: vi.fn(),
  REACT_DEVELOPER_TOOLS: "react-devtools-id",
  REDUX_DEVTOOLS: "redux-devtools-id",
}));

vi.mock("@electron-toolkit/utils", () => ({
  is: {
    dev: true,
  },
}));

describe("setupDevelopmentEnvironment", () => {
  const mockLogger: ILogger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (is as any).dev = true;
  });

  it("should do nothing if not in development environment", async () => {
    (is as any).dev = false;

    await setupDevelopmentEnvironment({ logger: mockLogger });

    expect(installExtension).not.toHaveBeenCalled();
  });

  it("should install default extensions when no config is provided", async () => {
    vi.mocked(installExtension).mockResolvedValue({
      name: "React Developer Tools",
    } as any);

    await setupDevelopmentEnvironment({ logger: mockLogger });

    expect(installExtension).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it("should use custom extensions and forceDownload flag when provided", async () => {
    vi.mocked(installExtension).mockResolvedValue({
      name: "Custom Extension",
    } as any);

    await setupDevelopmentEnvironment({
      extensions: [REACT_DEVELOPER_TOOLS],
      forceDownload: true,
      logger: mockLogger,
    });

    expect(installExtension).toHaveBeenCalledTimes(1);
    expect(installExtension).toHaveBeenCalledWith("react-devtools-id", {
      loadExtensionOptions: { allowFileAccess: true },
      forceDownload: true,
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "[DevTools] Successfully installed: Custom Extension",
    );
  });

  it("should handle installation failure gracefully and log an error", async () => {
    const error = new Error("Download failed");
    vi.mocked(installExtension).mockRejectedValue(error);

    await setupDevelopmentEnvironment({
      extensions: [REACT_DEVELOPER_TOOLS],
      logger: mockLogger,
    });

    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "[DevTools] Failed to install extension with ID: react-devtools-id",
      error,
    );
  });
});
