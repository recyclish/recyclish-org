import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";

// Mock the database functions
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    createNewsletterSubscription: vi.fn().mockResolvedValue({ success: true, reactivated: false }),
    getNewsletterSubscribers: vi.fn().mockResolvedValue([]),
    getNewsletterStats: vi.fn().mockResolvedValue({ total: 0, active: 0 }),
  };
});

// Mock the notification function
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext() {
  return {
    user: null,
    req: {} as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

function createAuthContext() {
  const user = {
    id: 1,
    openId: "test-open-id",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
    loginMethod: "oauth",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    ctx: {
      user,
      req: {} as any,
      res: {
        clearCookie: vi.fn(),
      } as any,
    },
  };
}

function createAdminContext() {
  const user = {
    id: 1,
    openId: "admin-open-id",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as const,
    loginMethod: "oauth",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    ctx: {
      user,
      req: {} as any,
      res: {
        clearCookie: vi.fn(),
      } as any,
    },
  };
}

describe("newsletter.subscribe", () => {
  it("allows public subscription with valid email and zip code", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.subscribe({
      email: "subscriber@example.com",
      zipCode: "12345",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Thank you");
  });

  it("accepts optional demographic fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.subscribe({
      email: "subscriber2@example.com",
      zipCode: "54321",
      age: "25-34",
      gender: "Male",
      sex: "Male",
      additionalInfo: "I'm interested in electronics recycling",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({
        email: "invalid-email",
        zipCode: "12345",
      })
    ).rejects.toThrow();
  });

  it("rejects zip code that is too short", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({
        email: "test@example.com",
        zipCode: "123",
      })
    ).rejects.toThrow();
  });
});

describe("newsletter.list", () => {
  it("requires admin authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.newsletter.list()).rejects.toThrow();
  });

  it("rejects non-admin users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.newsletter.list()).rejects.toThrow();
  });

  it("allows admin to list subscribers", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("newsletter.stats", () => {
  it("requires admin authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.newsletter.stats()).rejects.toThrow();
  });

  it("allows admin to get stats", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.stats();

    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("active");
  });
});
