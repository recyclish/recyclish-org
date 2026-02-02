import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createRegularUserContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("admin procedures", () => {
  it("allows admin to access stats endpoint", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail if the database is not available, but the authorization check should pass
    try {
      await caller.facility.stats();
    } catch (error: unknown) {
      // Database error is expected in test environment, but FORBIDDEN error means auth failed
      if (error instanceof Error && error.message.includes("FORBIDDEN")) {
        throw error;
      }
      // Database not available is acceptable in tests
      expect((error as Error).message).toContain("Database");
    }
  });

  it("denies regular user access to stats endpoint", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.facility.stats()).rejects.toThrow("permission");
  });

  it("denies unauthenticated user access to stats endpoint", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.facility.stats()).rejects.toThrow();
  });

  it("allows admin to access exportApproved endpoint", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.facility.exportApproved();
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("FORBIDDEN")) {
        throw error;
      }
      // Database not available is acceptable in tests
      expect((error as Error).message).toContain("Database");
    }
  });

  it("denies regular user access to exportApproved endpoint", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.facility.exportApproved()).rejects.toThrow("permission");
  });

  it("allows admin to update submission status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.facility.updateStatus({ id: 1, status: "approved" });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("FORBIDDEN")) {
        throw error;
      }
      // Database not available is acceptable in tests
      expect((error as Error).message).toContain("Database");
    }
  });

  it("denies regular user from updating submission status", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.facility.updateStatus({ id: 1, status: "approved" })
    ).rejects.toThrow("permission");
  });

  it("allows admin to delete submissions", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.facility.delete({ id: 1 });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("FORBIDDEN")) {
        throw error;
      }
      // Database not available is acceptable in tests
      expect((error as Error).message).toContain("Database");
    }
  });

  it("denies regular user from deleting submissions", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.facility.delete({ id: 1 })
    ).rejects.toThrow("permission");
  });
});

describe("public facility submission", () => {
  it("allows unauthenticated users to submit facilities", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.facility.submit({
        name: "Test Facility",
        address: "123 Test St",
        city: "Test City",
        state: "CA",
        category: "Electronics Recycling",
      });
    } catch (error: unknown) {
      // Database not available is acceptable in tests
      expect((error as Error).message).toContain("Database");
    }
  });
});
