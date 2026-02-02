import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
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

describe("favorites procedures", () => {
  it("denies unauthenticated user from adding favorites", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.favorites.add({
        facilityId: "test-facility-123",
        facilityName: "Test Recycling Center",
        facilityAddress: "123 Test St, Test City, TS 12345",
      })
    ).rejects.toThrow();
  });

  it("denies unauthenticated user from listing favorites", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.favorites.list()).rejects.toThrow();
  });

  it("denies unauthenticated user from removing favorites", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.favorites.remove({ facilityId: "test-facility-123" })
    ).rejects.toThrow();
  });

  it("denies unauthenticated user from getting favorite IDs", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.favorites.ids()).rejects.toThrow();
  });

  it("validates required fields when adding favorite", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Missing facilityId
    await expect(
      caller.favorites.add({
        facilityId: "",
        facilityName: "Test Center",
        facilityAddress: "123 Test St",
      })
    ).rejects.toThrow();

    // Missing facilityName
    await expect(
      caller.favorites.add({
        facilityId: "test-123",
        facilityName: "",
        facilityAddress: "123 Test St",
      })
    ).rejects.toThrow();

    // Missing facilityAddress
    await expect(
      caller.favorites.add({
        facilityId: "test-123",
        facilityName: "Test Center",
        facilityAddress: "",
      })
    ).rejects.toThrow();
  });

  it("validates facilityId when removing favorite", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.favorites.remove({ facilityId: "" })
    ).rejects.toThrow();
  });
});
