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

describe("Review Moderation - Admin Access", () => {
  it("admin can access adminList endpoint", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - admin has access
    const result = await caller.reviews.adminList();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can access adminStats endpoint", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - admin has access
    const result = await caller.reviews.adminStats();
    expect(Array.isArray(result)).toBe(true);
  });

  it("regular user cannot access adminList endpoint", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.reviews.adminList()).rejects.toThrow(
      "You do not have permission to access this resource"
    );
  });

  it("regular user cannot access adminStats endpoint", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.reviews.adminStats()).rejects.toThrow(
      "You do not have permission to access this resource"
    );
  });

  it("regular user cannot update review status", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.reviews.adminUpdateStatus({
        id: 1,
        status: "approved",
      })
    ).rejects.toThrow("You do not have permission to access this resource");
  });

  it("regular user cannot delete reviews as admin", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.reviews.adminDelete({ id: 1 })).rejects.toThrow(
      "You do not have permission to access this resource"
    );
  });
});

describe("Review Moderation - Status Validation", () => {
  it("adminUpdateStatus requires valid status enum", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Invalid status should throw validation error
    await expect(
      caller.reviews.adminUpdateStatus({
        id: 1,
        status: "invalid_status" as "approved",
      })
    ).rejects.toThrow();
  });

  it("adminList accepts optional status filter", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Should work with status filter
    const pendingResult = await caller.reviews.adminList({ status: "pending" });
    expect(Array.isArray(pendingResult)).toBe(true);

    // Should work with approved filter
    const approvedResult = await caller.reviews.adminList({ status: "approved" });
    expect(Array.isArray(approvedResult)).toBe(true);

    // Should work with rejected filter
    const rejectedResult = await caller.reviews.adminList({ status: "rejected" });
    expect(Array.isArray(rejectedResult)).toBe(true);
  });
});
