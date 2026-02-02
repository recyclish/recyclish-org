import { and, desc, eq, sql } from "drizzle-orm";
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
