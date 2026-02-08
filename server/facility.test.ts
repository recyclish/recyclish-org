import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createFacilitySubmission: vi.fn().mockResolvedValue({ insertId: 1 }),
  getFacilitySubmissions: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Test Recycling Center",
      address: "123 Test St",
      city: "Test City",
      state: "California",
      category: "Electronics Recyclers",
      status: "pending",
      createdAt: new Date(),
    },
  ]),
  updateFacilitySubmissionStatus: vi.fn().mockResolvedValue(undefined),
  getFacilitySubmissionById: vi.fn().mockResolvedValue({
    id: 1,
    name: "Test Recycling Center",
    address: "123 Test St",
    city: "Test City",
    state: "California",
    category: "Electronics Recyclers",
    status: "approved",
    materialsAccepted: "Electronics, Batteries",
    phone: "555-0100",
    email: "test@recycling.com",
    website: "https://test-recycling.com",
    zipCode: "90001",
    createdAt: new Date(),
  }),
  addFacility: vi.fn().mockResolvedValue({ insertId: 100 }),
}));

// Mock the notification function
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("facility.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a valid facility submission", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.facility.submit({
      name: "Green Earth Recycling",
      address: "123 Main St",
      city: "Los Angeles",
      state: "California",
      category: "Electronics Recyclers",
    });

    expect(result).toEqual({
      success: true,
      message: "Thank you! Your submission has been received and will be reviewed.",
    });
  });

  it("accepts a facility submission with all optional fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.facility.submit({
      name: "Complete Recycling Center",
      address: "456 Oak Ave",
      city: "San Francisco",
      state: "California",
      zipCode: "94102",
      phone: "(555) 123-4567",
      email: "info@complete-recycling.com",
      website: "https://complete-recycling.com",
      category: "Material Recovery Facilities (MRFs)",
      materialsAccepted: "Paper, plastic, glass, metal",
      additionalNotes: "Open weekdays 8am-5pm",
      submitterName: "John Doe",
      submitterEmail: "john@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects submission with missing required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.facility.submit({
        name: "",
        address: "123 Main St",
        city: "Los Angeles",
        state: "California",
        category: "Electronics Recyclers",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.facility.submit({
        name: "Test Center",
        address: "123 Main St",
        city: "Los Angeles",
        state: "California",
        category: "Electronics Recyclers",
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });
});

describe("facility.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns submissions for authenticated admin users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.facility.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("status");
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.facility.list()).rejects.toThrow();
  });
});

describe("facility.updateStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to update submission status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.facility.updateStatus({
      id: 1,
      status: "approved",
      reviewNotes: "Verified and approved",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects unauthenticated status updates", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.facility.updateStatus({
        id: 1,
        status: "approved",
      })
    ).rejects.toThrow();
  });
});
