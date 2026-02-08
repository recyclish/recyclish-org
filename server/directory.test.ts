import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("directory.list", () => {
  it("returns an array of facilities from the database", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directory.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Check that the first facility has the expected shape
    const first = result[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("address");
    expect(first).toHaveProperty("state");
    expect(first).toHaveProperty("category");
    expect(first).toHaveProperty("isActive");
  });

  it("returns only active facilities", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directory.list();

    // All returned facilities should be active
    for (const facility of result) {
      expect(facility.isActive).toBe(1);
    }
  });

  it("returns the expected number of migrated facilities", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directory.list();

    // We imported 2861 records from CSV
    expect(result.length).toBeGreaterThanOrEqual(2861);
  });
});

describe("directory.stats", () => {
  it("returns facility statistics with total, byState, and byCategory", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.directory.stats();

    expect(stats).toHaveProperty("total");
    expect(stats.total).toBeGreaterThan(0);
    expect(stats).toHaveProperty("byState");
    expect(Array.isArray(stats.byState)).toBe(true);
    expect(stats.byState.length).toBeGreaterThan(0);
    expect(stats).toHaveProperty("byCategory");
    expect(Array.isArray(stats.byCategory)).toBe(true);
    expect(stats.byCategory.length).toBeGreaterThan(0);

    // Check structure of byState entries
    const stateEntry = stats.byState[0];
    expect(stateEntry).toHaveProperty("state");
    expect(stateEntry).toHaveProperty("count");
    expect(typeof stateEntry.count).toBe("number");
  });
});

describe("directory.getById", () => {
  it("returns a facility when given a valid ID", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const facility = await caller.directory.getById({ id: 1 });

    expect(facility).not.toBeNull();
    expect(facility.id).toBe(1);
    expect(facility).toHaveProperty("name");
    expect(facility).toHaveProperty("category");
  });

  it("throws NOT_FOUND for non-existent facility", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.directory.getById({ id: 999999 })).rejects.toThrow();
  });
});

describe("directory.add (admin only)", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.directory.add({
        name: "Test Facility",
        address: "123 Test St",
        state: "Indiana",
        category: "General Recycling",
      })
    ).rejects.toThrow();
  });

  it("allows admin to add a facility", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directory.add({
      name: "Test Admin Facility",
      address: "456 Admin Ave",
      state: "Indiana",
      category: "Municipal Recycling",
      phone: "555-0123",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");

    // Verify it appears in the list
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx.ctx);
    const facility = await publicCaller.directory.getById({ id: result.id });
    expect(facility.name).toBe("Test Admin Facility");
    expect(facility.source).toBe("admin_added");

    // Clean up - deactivate the test facility
    await caller.directory.deactivate({ id: result.id });
  });
});

describe("directory.deactivate (admin only)", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.directory.deactivate({ id: 1 })).rejects.toThrow();
  });
});
