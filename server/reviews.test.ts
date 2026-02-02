import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
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

describe("reviews.list", () => {
  it("returns an empty array for a facility with no reviews", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.list({ facilityId: "nonexistent-facility" });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews.stats", () => {
  it("returns stats with zero reviews for a facility with no reviews", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.stats({ facilityId: "nonexistent-facility" });

    expect(result).toHaveProperty("avgRating");
    expect(result).toHaveProperty("totalReviews");
    expect(result.totalReviews).toBe(0);
  });
});

describe("reviews.submit", () => {
  it("requires authentication to submit a review", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.reviews.submit({
        facilityId: "test-facility",
        facilityName: "Test Facility",
        facilityAddress: "123 Test St",
        rating: 5,
      })
    ).rejects.toThrow();
  });
});

describe("reviews.hasReviewed", () => {
  it("requires authentication to check review status", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.reviews.hasReviewed({ facilityId: "test-facility" })
    ).rejects.toThrow();
  });

  it("returns hasReviewed status for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.hasReviewed({ facilityId: "test-facility-new" });

    expect(result).toHaveProperty("hasReviewed");
    expect(typeof result.hasReviewed).toBe("boolean");
  });
});

describe("reviews.adminList", () => {
  it("requires admin role to list all reviews", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.reviews.adminList()).rejects.toThrow(
      "You do not have permission to access this resource"
    );
  });

  it("allows admin to list all reviews", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.adminList();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews.adminStats", () => {
  it("requires admin role to view review statistics", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.reviews.adminStats()).rejects.toThrow(
      "You do not have permission to access this resource"
    );
  });

  it("allows admin to view review statistics", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.adminStats();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews.markHelpful", () => {
  it("requires authentication to mark a review as helpful", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.reviews.markHelpful({ reviewId: 1 })
    ).rejects.toThrow();
  });
});

describe("reviews.helpfulVotes", () => {
  it("requires authentication to get helpful votes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.reviews.helpfulVotes()).rejects.toThrow();
  });

  it("returns helpful votes for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.helpfulVotes();

    expect(Array.isArray(result)).toBe(true);
  });
});
