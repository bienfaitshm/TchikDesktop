import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLazyAppClients, getApiClient } from "./index";
import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import * as apis from "@/packages/@core/apis/clients";

vi.mock("@/packages/electron-ipc-rest/ipc.client", () => {
  return {
    IpcClient: vi.fn(),
  };
});

vi.mock("@/packages/@core/apis/clients", () => ({
  createSearchEngineApis: vi.fn(() => ({ search: "mock-search" })),
  createUserApis: vi.fn(() => ({ users: "mock-users" })),
  createTutorApis: vi.fn(() => ({ tutors: "mock-tutors" })),
  createClassroomApis: vi.fn(() => ({ classroom: "mock-classroom" })),
  createEnrollmentApis: vi.fn(() => ({ enrollment: "mock-enrollment" })),
  createOptionApis: vi.fn(() => ({ option: "mock-option" })),
  createSchoolApis: vi.fn(() => ({ school: "mock-school" })),
  createStatsApis: vi.fn(() => ({ stats: "mock-stats" })),
  createDocumentExportApis: vi.fn(() => ({ exportDocuments: "mock-export" })),
  createAppInfosApis: vi.fn(() => ({ appInfos: "mock-appInfos" })),
  createSeatingApis: vi.fn(() => ({ seating: "mock-seating" })),
  createWalletApis: vi.fn(() => ({ wallet: "mock-wallet" })),
  createFeeTypeApis: vi.fn(() => ({ feeType: "mock-feeType" })),
  createFeeScheduleApis: vi.fn(() => ({ feeSchedule: "mock-feeSchedule" })),
  createFeeConfigurationApis: vi.fn(() => ({
    feeConfiguration: "mock-feeConfig",
  })),
  createFeeAssignmentApi: vi.fn(() => ({
    feeAssignment: "mock-feeAssignment",
  })),
  createStudentPaymentApis: vi.fn(() => ({
    studentPayment: "mock-studentPayment",
  })),
  createDailyExchangeRateApis: vi.fn(() => ({
    exchangeRate: "mock-exchangeRate",
  })),
  createPaymentApis: vi.fn(() => ({ payment: "mock-payment" })),
  createDashboardApis: vi.fn(() => ({ dashboard: "mock-dashboard" })),
  createPrintingApis: vi.fn(() => ({ print: "mock-print" })),
}));

describe("API Proxy & Client Initialization", () => {
  let mockIpcClient: IpcClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIpcClient = new IpcClient({} as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should lazily instantiate domain API clients on first access and cache them", () => {
    const clients = createLazyAppClients(mockIpcClient);

    expect(apis.createUserApis).not.toHaveBeenCalled();

    const usersClient = clients.users;
    expect(usersClient).toEqual({ users: "mock-users" });
    expect(apis.createUserApis).toHaveBeenCalledTimes(1);
    expect(apis.createUserApis).toHaveBeenCalledWith(mockIpcClient);

    const cachedUsersClient = clients.users;
    expect(cachedUsersClient).toBe(usersClient);
    expect(apis.createUserApis).toHaveBeenCalledTimes(1);
  });

  it("should return undefined for unregistered properties", () => {
    const clients = createLazyAppClients(mockIpcClient);
    const nonExistent = (clients as any).nonExistentDomain;
    expect(nonExistent).toBeUndefined();
  });

  it("should prevent direct mutations via set trap", () => {
    const clients = createLazyAppClients(mockIpcClient);
    const result = Reflect.set(clients, "users", {});
    expect(result).toBe(false);
  });

  it("should return correct own keys matching the API registry", () => {
    const clients = createLazyAppClients(mockIpcClient);
    const keys = Reflect.ownKeys(clients);
    expect(keys).toContain("users");
    expect(keys).toContain("search");
    expect(keys.length).toBe(21);
  });

  it("should return proper property descriptors for registered properties", () => {
    const clients = createLazyAppClients(mockIpcClient);
    const descriptor = Reflect.getOwnPropertyDescriptor(clients, "users");
    expect(descriptor).toEqual({
      enumerable: true,
      configurable: true,
      writable: false,
    });

    const invalidDescriptor = Reflect.getOwnPropertyDescriptor(
      clients,
      "unknown",
    );
    expect(invalidDescriptor).toBeUndefined();
  });

  it("should pass symbols directly through Reflect.get", () => {
    const clients = createLazyAppClients(mockIpcClient);
    const sym = Symbol.iterator;
    const result = Reflect.get(clients, sym);
    expect(result).toBeUndefined();
  });

  it("should initialize apiClient successfully when window.electron is present", () => {
    const mockIpcRenderer = { send: vi.fn() };
    vi.stubGlobal("window", {
      electron: {
        ipcRenderer: mockIpcRenderer,
      },
    });

    const client = getApiClient();
    expect(client).toBeDefined();
    expect(IpcClient).toHaveBeenCalledWith(mockIpcRenderer);
  });
});
