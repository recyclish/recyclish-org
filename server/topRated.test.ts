import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("reviews.topRated", () => {
  it("returns an array of top-rated facilities", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.topRated({ limit: 6 });

    // Should return an array
    expect(Array.isArray(result)).toBe(true);
    
    // Each item should have the expected structure
    if (result.length > 0) {
      const facility = result[0];
      expect(facility).toHaveProperty("facilityId");
      expect(facility).toHaveProperty("facilityName");
      expect(facility).toHaveProperty("facilityAddress");
      expect(facility).toHaveProperty("avgRating");
      expect(facility).toHaveProperty("totalReviews");
      
      // avgRating should be a number between 1 and 5
      expect(typeof facility.avgRating).toBe("number");
      expect(facility.avgRating).toBeGreaterThanOrEqual(1);
      expect(facility.avgRating).toBeLessThanOrEqual(5);
      
      // totalReviews should be a positive number
      expect(typeof facility.totalReviews).toBe("number");
      expect(facility.totalReviews).toBeGreaterThanOrEqual(1);
    }
  });

  it("respects the limit parameter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.topRated({ limit: 3 });

    // Should return at most 3 items
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("uses default limit of 6 when not specified", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.topRated();

    // Should return at most 6 items (default limit)
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it("returns facilities ordered by rating (highest first)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.topRated({ limit: 10 });

    // If there are multiple results, they should be in descending order by rating
    if (result.length > 1) {
      for (let i = 1; i < result.length; i++) {
        // Current rating should be less than or equal to previous
        // (allowing equal ratings, which are then sorted by review count)
        expect(result[i].avgRating).toBeLessThanOrEqual(result[i - 1].avgRating);
      }
    }
  });
});
