import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, facilitySubmissions, InsertFacilitySubmission, userFavorites, InsertUserFavorite } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Facility submission functions
export async function createFacilitySubmission(submission: InsertFacilitySubmission) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(facilitySubmissions).values(submission);
  return result;
}

export async function getFacilitySubmissions(status?: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (status) {
    return db.select()
      .from(facilitySubmissions)
      .where(eq(facilitySubmissions.status, status))
      .orderBy(desc(facilitySubmissions.createdAt));
  }
  
  return db.select()
    .from(facilitySubmissions)
    .orderBy(desc(facilitySubmissions.createdAt));
}

export async function updateFacilitySubmissionStatus(
  id: number, 
  status: "pending" | "approved" | "rejected",
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(facilitySubmissions)
    .set({ status, reviewNotes: reviewNotes || null })
    .where(eq(facilitySubmissions.id, id));
}

export async function getFacilitySubmissionById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select()
    .from(facilitySubmissions)
    .where(eq(facilitySubmissions.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function deleteFacilitySubmission(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(facilitySubmissions)
    .where(eq(facilitySubmissions.id, id));
}

export async function getSubmissionStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({
    status: facilitySubmissions.status,
    count: sql<number>`count(*)`
  })
    .from(facilitySubmissions)
    .groupBy(facilitySubmissions.status);

  return result;
}

// User favorites functions
export async function addUserFavorite(favorite: InsertUserFavorite) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if already favorited
  const existing = await db.select()
    .from(userFavorites)
    .where(and(
      eq(userFavorites.userId, favorite.userId),
      eq(userFavorites.facilityId, favorite.facilityId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return { alreadyExists: true, id: existing[0].id };
  }

  const result = await db.insert(userFavorites).values(favorite);
  return { alreadyExists: false, id: Number(result[0].insertId) };
}

export async function removeUserFavorite(userId: number, facilityId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(userFavorites)
    .where(and(
      eq(userFavorites.userId, userId),
      eq(userFavorites.facilityId, facilityId)
    ));
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select()
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId))
    .orderBy(desc(userFavorites.createdAt));
}

export async function isUserFavorite(userId: number, facilityId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select()
    .from(userFavorites)
    .where(and(
      eq(userFavorites.userId, userId),
      eq(userFavorites.facilityId, facilityId)
    ))
    .limit(1);

  return result.length > 0;
}

export async function getUserFavoriteIds(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({ facilityId: userFavorites.facilityId })
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId));

  return result.map(r => r.facilityId);
}

// Facility report functions
import { facilityReports, InsertFacilityReport } from "../drizzle/schema";

export async function createFacilityReport(report: InsertFacilityReport) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(facilityReports).values(report);
  return { id: Number(result[0].insertId) };
}

export async function getFacilityReports(status?: "pending" | "reviewed" | "resolved" | "dismissed") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (status) {
    return db.select()
      .from(facilityReports)
      .where(eq(facilityReports.status, status))
      .orderBy(desc(facilityReports.createdAt));
  }
  
  return db.select()
    .from(facilityReports)
    .orderBy(desc(facilityReports.createdAt));
}

export async function updateFacilityReportStatus(
  id: number, 
  status: "pending" | "reviewed" | "resolved" | "dismissed",
  adminNotes?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(facilityReports)
    .set({ status, adminNotes: adminNotes || null })
    .where(eq(facilityReports.id, id));
}

export async function getFacilityReportById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select()
    .from(facilityReports)
    .where(eq(facilityReports.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function deleteFacilityReport(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(facilityReports)
    .where(eq(facilityReports.id, id));
}

export async function getReportStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({
    status: facilityReports.status,
    count: sql<number>`count(*)`
  })
    .from(facilityReports)
    .groupBy(facilityReports.status);

  return result;
}


// Facility review functions
import { facilityReviews, InsertFacilityReview, reviewHelpfulVotes, InsertReviewHelpfulVote } from "../drizzle/schema";

export async function createFacilityReview(review: InsertFacilityReview) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if user already reviewed this facility
  const existing = await db.select()
    .from(facilityReviews)
    .where(and(
      eq(facilityReviews.userId, review.userId),
      eq(facilityReviews.facilityId, review.facilityId)
    ))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("You have already reviewed this facility");
  }

  const result = await db.insert(facilityReviews).values(review);
  return { id: Number(result[0].insertId) };
}

export async function updateFacilityReview(
  id: number,
  userId: number,
  updates: Partial<Pick<InsertFacilityReview, 'rating' | 'title' | 'content' | 'serviceRating' | 'cleanlinessRating' | 'convenienceRating'>>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Verify ownership
  const existing = await db.select()
    .from(facilityReviews)
    .where(and(
      eq(facilityReviews.id, id),
      eq(facilityReviews.userId, userId)
    ))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("Review not found or you don't have permission to edit it");
  }

  await db.update(facilityReviews)
    .set(updates)
    .where(eq(facilityReviews.id, id));
}

export async function deleteFacilityReview(id: number, userId: number, isAdmin: boolean = false) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (isAdmin) {
    // Admin can delete any review
    await db.delete(facilityReviews).where(eq(facilityReviews.id, id));
  } else {
    // User can only delete their own review
    const result = await db.delete(facilityReviews)
      .where(and(
        eq(facilityReviews.id, id),
        eq(facilityReviews.userId, userId)
      ));
  }
}

export async function getFacilityReviews(facilityId: string, status: "pending" | "approved" | "rejected" = "approved") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select()
    .from(facilityReviews)
    .where(and(
      eq(facilityReviews.facilityId, facilityId),
      eq(facilityReviews.status, status)
    ))
    .orderBy(desc(facilityReviews.createdAt));
}

export async function getFacilityReviewById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select()
    .from(facilityReviews)
    .where(eq(facilityReviews.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getFacilityRatingStats(facilityId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({
    avgRating: sql<number>`AVG(rating)`,
    totalReviews: sql<number>`COUNT(*)`,
    avgService: sql<number>`AVG(serviceRating)`,
    avgCleanliness: sql<number>`AVG(cleanlinessRating)`,
    avgConvenience: sql<number>`AVG(convenienceRating)`,
  })
    .from(facilityReviews)
    .where(and(
      eq(facilityReviews.facilityId, facilityId),
      eq(facilityReviews.status, "approved")
    ));

  return result[0];
}

export async function getBatchFacilityRatingStats(facilityIds: string[]) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (facilityIds.length === 0) {
    return {};
  }

  const result = await db.select({
    facilityId: facilityReviews.facilityId,
    avgRating: sql<number>`AVG(rating)`,
    totalReviews: sql<number>`COUNT(*)`,
  })
    .from(facilityReviews)
    .where(and(
      inArray(facilityReviews.facilityId, facilityIds),
      eq(facilityReviews.status, "approved")
    ))
    .groupBy(facilityReviews.facilityId);

  // Convert to a map for easy lookup
  const statsMap: Record<string, { average: number; count: number }> = {};
  for (const row of result) {
    statsMap[row.facilityId] = {
      average: row.avgRating ? Number(row.avgRating.toFixed(1)) : 0,
      count: row.totalReviews ? Number(row.totalReviews) : 0,
    };
  }

  return statsMap;
}

export async function getAllReviewsForAdmin(status?: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (status) {
    return db.select()
      .from(facilityReviews)
      .where(eq(facilityReviews.status, status))
      .orderBy(desc(facilityReviews.createdAt));
  }
  
  return db.select()
    .from(facilityReviews)
    .orderBy(desc(facilityReviews.createdAt));
}

export async function updateReviewStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  adminNotes?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(facilityReviews)
    .set({ status, adminNotes: adminNotes || null })
    .where(eq(facilityReviews.id, id));
}

export async function getReviewStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({
    status: facilityReviews.status,
    count: sql<number>`count(*)`
  })
    .from(facilityReviews)
    .groupBy(facilityReviews.status);

  return result;
}

// Helpful vote functions
export async function addHelpfulVote(reviewId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if already voted
  const existing = await db.select()
    .from(reviewHelpfulVotes)
    .where(and(
      eq(reviewHelpfulVotes.reviewId, reviewId),
      eq(reviewHelpfulVotes.userId, userId)
    ))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("You have already marked this review as helpful");
  }

  // Add vote
  await db.insert(reviewHelpfulVotes).values({ reviewId, userId });

  // Increment helpful count on review
  await db.update(facilityReviews)
    .set({ helpfulCount: sql`helpfulCount + 1` })
    .where(eq(facilityReviews.id, reviewId));
}

export async function removeHelpfulVote(reviewId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.delete(reviewHelpfulVotes)
    .where(and(
      eq(reviewHelpfulVotes.reviewId, reviewId),
      eq(reviewHelpfulVotes.userId, userId)
    ));

  // Decrement helpful count on review
  await db.update(facilityReviews)
    .set({ helpfulCount: sql`GREATEST(helpfulCount - 1, 0)` })
    .where(eq(facilityReviews.id, reviewId));
}

export async function getUserHelpfulVotes(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({ reviewId: reviewHelpfulVotes.reviewId })
    .from(reviewHelpfulVotes)
    .where(eq(reviewHelpfulVotes.userId, userId));

  return result.map(r => r.reviewId);
}

export async function hasUserReviewedFacility(userId: number, facilityId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select()
    .from(facilityReviews)
    .where(and(
      eq(facilityReviews.userId, userId),
      eq(facilityReviews.facilityId, facilityId)
    ))
    .limit(1);

  return result.length > 0;
}


// Get top-rated facilities based on reviews
export async function getTopRatedFacilities(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get facilities with at least one review, ordered by average rating and review count
  const result = await db.select({
    facilityId: facilityReviews.facilityId,
    facilityName: facilityReviews.facilityName,
    facilityAddress: facilityReviews.facilityAddress,
    avgRating: sql<number>`ROUND(AVG(rating), 1)`,
    totalReviews: sql<number>`COUNT(*)`,
  })
    .from(facilityReviews)
    .where(eq(facilityReviews.status, "approved"))
    .groupBy(facilityReviews.facilityId, facilityReviews.facilityName, facilityReviews.facilityAddress)
    .having(sql`COUNT(*) >= 1`)
    .orderBy(sql`AVG(rating) DESC`, sql`COUNT(*) DESC`)
    .limit(limit);

  return result.map(r => ({
    facilityId: r.facilityId,
    facilityName: r.facilityName,
    facilityAddress: r.facilityAddress,
    avgRating: Number(r.avgRating),
    totalReviews: Number(r.totalReviews),
  }));
}
