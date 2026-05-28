import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupDevelopmentEnvironment } from "./electron-dev-extension";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { is } from "@electron-toolkit/utils";

vi.mock("electron-devtools-installer", () => ({
  default: vi.fn(),
  REACT_DEVELOPER_TOOLS: { id: "REACT_ID", description: "react" },
  REDUX_DEVTOOLS: { id: "REDUX_ID", description: "redux" },
}));

vi.mock("@electron-toolkit/utils", () => ({
  is: { dev: true },
}));

describe("setupDevelopmentEnvironment", () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (is as any).dev = true;
  });

  it("ne devrait rien faire si nous ne sommes pas en mode développement", async () => {
    (is as any).dev = false;

    await setupDevelopmentEnvironment();

    expect(installExtension).not.toHaveBeenCalled();
  });

  it("devrait appeler installExtension avec les bons paramètres", async () => {
    vi.mocked(installExtension).mockResolvedValue(
      "React Developer Tools" as any,
    );

    await setupDevelopmentEnvironment({
      extensions: [REACT_DEVELOPER_TOOLS],
      logger: mockLogger,
    });

    expect(installExtension).toHaveBeenCalledWith(
      REACT_DEVELOPER_TOOLS,
      expect.objectContaining({ forceDownload: false }),
    );

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("React Developer Tools"),
    );
  });

  it("devrait capturer les erreurs sans faire crash le processus", async () => {
    const error = new Error("Network Error");
    vi.mocked(installExtension).mockRejectedValue(error);

    await expect(
      setupDevelopmentEnvironment({
        extensions: [REACT_DEVELOPER_TOOLS],
        logger: mockLogger,
      }),
    ).resolves.not.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Échec de l'installation"),
      error,
    );
  });

  it("devrait gérer plusieurs extensions", async () => {
    vi.mocked(installExtension).mockResolvedValue("OK" as any);

    const extensions = [
      REACT_DEVELOPER_TOOLS,
      { id: "OTHER", description: "other" },
    ];
    await setupDevelopmentEnvironment({ extensions, logger: mockLogger });

    expect(installExtension).toHaveBeenCalledTimes(extensions.length);
  });
});
