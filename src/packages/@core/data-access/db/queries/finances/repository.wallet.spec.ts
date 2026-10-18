import { describe, it, expect, vi, beforeEach } from "vitest";
import { WalletRepository } from "./repository.wallet";
import { DatabaseError } from "@/packages/drizzle-queries";

vi.mock("@/packages/logger", () => ({
  getLogger: vi.fn(),
}));

describe("WalletRepository", () => {
  let repository: WalletRepository;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      run: vi.fn(),
    };

    repository = new WalletRepository({} as any);
    vi.spyOn(repository, "getClient").mockReturnValue(mockClient);
  });

  describe("fetchOptions", () => {
    it("should retrieve wallet options successfully", () => {
      const mockWallets = [{ walletId: "1", name: "Main Wallet" }];
      vi.spyOn(repository, "findMany").mockReturnValue(mockWallets as any);

      const result = repository.fetchOptions();

      expect(result).toEqual(mockWallets);
      expect(repository.findMany).toHaveBeenCalledWith(undefined);
    });
  });

  describe("updateWalletBalance", () => {
    it("should successfully execute wallet balance update with validated payments", () => {
      const walletId = "wallet-123";

      expect(() => repository.updateWalletBalance(walletId)).not.toThrow();
      expect(mockClient.update).toHaveBeenCalled();
      expect(mockClient.set).toHaveBeenCalled();
      expect(mockClient.run).toHaveBeenCalled();
    });

    it("should catch database errors, log them, and throw a wrapped DatabaseError", () => {
      const walletId = "wallet-123";
      const originalError = new Error("SQLite constraint failure");
      mockClient.run.mockImplementation(() => {
        throw originalError;
      });

      const logErrorSpy = vi.spyOn(repository as any, "logError");

      expect(() => repository.updateWalletBalance(walletId)).toThrow(
        DatabaseError,
      );
      expect(logErrorSpy).toHaveBeenCalledWith(
        "updateWalletBalance",
        expect.any(DatabaseError),
        { walletId },
      );
    });
  });
});
