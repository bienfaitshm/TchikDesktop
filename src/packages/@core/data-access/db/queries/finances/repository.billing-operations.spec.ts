import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  FeeConfigurationRepository,
  DailyExchangeRateRepository,
} from "./repository.billing-operations";
import { DatabaseError } from "@/packages/drizzle-queries";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/options";

vi.mock("@/packages/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("FeeConfigurationRepository", () => {
  let repository: FeeConfigurationRepository;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      query: {
        feeConfigurations: {
          findMany: vi.fn().mockReturnValue({
            sync: vi.fn(),
          }),
        },
      },
    };
    repository = new FeeConfigurationRepository(mockDb);
  });

  describe("findApplicableConfigurations", () => {
    const context = {
      schoolId: "school-1",
      yearId: "year-1",
      classroomId: "class-1",
      optionId: "opt-1",
      section: SECTION_ENUM.PRIMARY,
    };

    it("should return prioritized configurations on nominal case", () => {
      const mockConfigs = [
        {
          feeConfigId: "cfg-1",
          feeTypeId: "fee-type-1",
          classroomId: "class-1",
          optionId: null,
          section: null,
          feeType: { feeTypeId: "fee-type-1", schedules: [] },
        },
      ];

      mockDb.query.feeConfigurations.findMany.mockReturnValue({
        sync: vi.fn().mockReturnValue(mockConfigs),
      });

      const result = repository.findApplicableConfigurations(context);
      expect(result).toHaveLength(1);
      expect(result[0].feeConfigId).toBe("cfg-1");
    });

    it("should return an empty array when no configurations match", () => {
      mockDb.query.feeConfigurations.findMany.mockReturnValue({
        sync: vi.fn().mockReturnValue([]),
      });

      const result = repository.findApplicableConfigurations(context);
      expect(result).toEqual([]);
    });

    it("should throw a DatabaseError when query execution fails", () => {
      mockDb.query.feeConfigurations.findMany.mockReturnValue({
        sync: vi.fn().mockImplementation(() => {
          throw new Error("DB connection lost");
        }),
      });

      expect(() => repository.findApplicableConfigurations(context)).toThrow(
        DatabaseError,
      );
    });
  });
});

describe("DailyExchangeRateRepository", () => {
  let repository: DailyExchangeRateRepository;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {};
    repository = new DailyExchangeRateRepository(mockDb);
  });

  describe("getLatestExchangeRate", () => {
    it("should return the latest exchange rate when records exist", () => {
      const mockRate = { rateId: "rate-1", rate: 2800, date: "2026-06-01" };
      vi.spyOn(repository, "findMany").mockReturnValue([mockRate] as any);

      const result = repository.getLatestExchangeRate({});
      expect(result).toEqual(mockRate);
    });

    it("should return null when no exchange rates are found", () => {
      vi.spyOn(repository, "findMany").mockReturnValue([]);

      const result = repository.getLatestExchangeRate({});
      expect(result).toBeNull();
    });

    it("should throw a DatabaseError when findMany fails", () => {
      vi.spyOn(repository, "findMany").mockImplementation(() => {
        throw new Error("Query error");
      });

      expect(() => repository.getLatestExchangeRate({})).toThrow(DatabaseError);
    });
  });
});
