import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { 
  createFacilitySubmission, 
  getFacilitySubmissions, 
  updateFacilitySubmissionStatus,
  getFacilitySubmissionById,
  deleteFacilitySubmission,
  getSubmissionStats,
  addUserFavorite,
  removeUserFavorite,
  getUserFavorites,
  getUserFavoriteIds,
  createFacilityReport,
  getFacilityReports,
  updateFacilityReportStatus,
  getFacilityReportById,
  deleteFacilityReport,
  getReportStats,
  createFacilityReview,
  updateFacilityReview,
  deleteFacilityReview,
  getFacilityReviews,
  getFacilityRatingStats,
  getBatchFacilityRatingStats,
  getAllReviewsForAdmin,
  updateReviewStatus,
  getReviewStats,
  addHelpfulVote,
  removeHelpfulVote,
  getUserHelpfulVotes,
  hasUserReviewedFacility,
  getTopRatedFacilities,
  createNewsletterSubscription,
  getNewsletterSubscribers,
  getNewsletterStats
} from "./db";
import { notifyOwner } from "./_core/notification";

// Admin-only procedure - checks if user has admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'You do not have permission to access this resource' 
    });
  }
  return next({ ctx });
});

// Validation schema for facility submission
const facilitySubmissionSchema = z.object({
  name: z.string().min(1, "Facility name is required").max(255),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(320).optional().or(z.literal("")),
  website: z.string().url().max(500).optional().or(z.literal("")),
  category: z.string().min(1, "Category is required").max(100),
  materialsAccepted: z.string().max(1000).optional(),
  additionalNotes: z.string().max(2000).optional(),
  submitterName: z.string().max(255).optional(),
  submitterEmail: z.string().email().max(320).optional().or(z.literal("")),
});

// Validation schema for adding a favorite
const addFavoriteSchema = z.object({
  facilityId: z.string().min(1).max(64),
  facilityName: z.string().min(1).max(255),
  facilityAddress: z.string().min(1).max(500),
  facilityCategory: z.string().max(100).optional(),
  facilityPhone: z.string().max(50).optional(),
  facilityWebsite: z.string().max(500).optional(),
  facilityFeedstock: z.string().optional(),
  facilityLatitude: z.string().max(20).optional(),
  facilityLongitude: z.string().max(20).optional(),
});

// Validation schema for facility report
const facilityReportSchema = z.object({
  facilityId: z.string().min(1).max(64),
  facilityName: z.string().min(1).max(255),
  facilityAddress: z.string().min(1).max(500),
  issueType: z.enum([
    "permanently_closed",
    "temporarily_closed",
    "wrong_address",
    "wrong_phone",
    "wrong_hours",
    "wrong_materials",
    "duplicate_listing",
    "other"
  ]),
  description: z.string().max(2000).optional(),
  reporterName: z.string().max(255).optional(),
  reporterEmail: z.string().email().max(320).optional().or(z.literal("")),
});

// Validation schema for facility review
const facilityReviewSchema = z.object({
  facilityId: z.string().min(1).max(64),
  facilityName: z.string().min(1).max(255),
  facilityAddress: z.string().min(1).max(500),
  rating: z.number().min(1).max(5),
  title: z.string().max(255).optional(),
  content: z.string().max(2000).optional(),
  serviceRating: z.number().min(1).max(5).optional(),
  cleanlinessRating: z.number().min(1).max(5).optional(),
  convenienceRating: z.number().min(1).max(5).optional(),
});

// Validation schema for newsletter subscription
const newsletterSubscriptionSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(320),
  zipCode: z.string().min(5, "Please enter a valid zip code").max(20),
  age: z.string().max(20).optional(),
  gender: z.string().max(50).optional(),
  sex: z.string().max(50).optional(),
  additionalInfo: z.string().max(1000).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Facility submission routes
  facility: router({
    // Public endpoint - anyone can submit a facility
    submit: publicProcedure
      .input(facilitySubmissionSchema)
      .mutation(async ({ input }) => {
        // Clean up optional empty strings
        const cleanedInput = {
          ...input,
          email: input.email || null,
          website: input.website || null,
          submitterEmail: input.submitterEmail || null,
          zipCode: input.zipCode || null,
          phone: input.phone || null,
          materialsAccepted: input.materialsAccepted || null,
          additionalNotes: input.additionalNotes || null,
          submitterName: input.submitterName || null,
        };

        await createFacilitySubmission(cleanedInput);

        // Notify owner about new submission
        await notifyOwner({
          title: "New Facility Submission",
          content: `A new recycling facility has been submitted for review:\n\n**${input.name}**\n${input.address}, ${input.city}, ${input.state}\nCategory: ${input.category}\n\nPlease review in the admin panel.`,
        });

        return { success: true, message: "Thank you! Your submission has been received and will be reviewed." };
      }),

    // Protected endpoint - list submissions (admin sees all, users see their own)
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const submissions = await getFacilitySubmissions(input?.status);
        return submissions;
      }),

    // Admin-only endpoint - update submission status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateFacilitySubmissionStatus(input.id, input.status, input.reviewNotes);
        return { success: true };
      }),

    // Admin-only endpoint - get single submission by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const submission = await getFacilitySubmissionById(input.id);
        if (!submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
        }
        return submission;
      }),

    // Admin-only endpoint - delete a submission
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFacilitySubmission(input.id);
        return { success: true };
      }),

    // Admin-only endpoint - get submission statistics
    stats: adminProcedure
      .query(async () => {
        const stats = await getSubmissionStats();
        return stats;
      }),

    // Admin-only endpoint - export approved submissions as CSV data
    exportApproved: adminProcedure
      .query(async () => {
        const approved = await getFacilitySubmissions("approved");
        return approved.map(sub => ({
          Name: sub.name,
          Address: `${sub.address}, ${sub.city}, ${sub.state} ${sub.zipCode || ''}`.trim(),
          State: sub.state,
          County: "",
          Phone: sub.phone || "",
          Email: sub.email || "",
          Website: sub.website || "",
          Category: sub.category,
          Facility_Type: "User Submitted",
          Feedstock: sub.materialsAccepted || "",
          Latitude: "",
          Longitude: "",
          NAICS_Code: ""
        }));
      }),
  }),

  // User favorites routes
  favorites: router({
    // Add a facility to favorites
    add: protectedProcedure
      .input(addFavoriteSchema)
      .mutation(async ({ ctx, input }) => {
        const result = await addUserFavorite({
          userId: ctx.user.id,
          facilityId: input.facilityId,
          facilityName: input.facilityName,
          facilityAddress: input.facilityAddress,
          facilityCategory: input.facilityCategory || null,
          facilityPhone: input.facilityPhone || null,
          facilityWebsite: input.facilityWebsite || null,
          facilityFeedstock: input.facilityFeedstock || null,
          facilityLatitude: input.facilityLatitude || null,
          facilityLongitude: input.facilityLongitude || null,
        });
        return { 
          success: true, 
          alreadyExists: result.alreadyExists,
          message: result.alreadyExists ? "Already in favorites" : "Added to favorites" 
        };
      }),

    // Remove a facility from favorites
    remove: protectedProcedure
      .input(z.object({ facilityId: z.string().min(1).max(64) }))
      .mutation(async ({ ctx, input }) => {
        await removeUserFavorite(ctx.user.id, input.facilityId);
        return { success: true, message: "Removed from favorites" };
      }),

    // Get all user favorites
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const favorites = await getUserFavorites(ctx.user.id);
        return favorites;
      }),

    // Get list of favorite facility IDs (for checking if facilities are favorited)
    ids: protectedProcedure
      .query(async ({ ctx }) => {
        const ids = await getUserFavoriteIds(ctx.user.id);
        return ids;
      }),
  }),

  // Facility reports routes
  reports: router({
    // Public endpoint - anyone can report an issue
    submit: publicProcedure
      .input(facilityReportSchema)
      .mutation(async ({ input }) => {
        // Clean up optional empty strings
        const cleanedInput = {
          ...input,
          description: input.description || null,
          reporterName: input.reporterName || null,
          reporterEmail: input.reporterEmail || null,
        };

        await createFacilityReport(cleanedInput);

        // Format issue type for notification
        const issueTypeLabels: Record<string, string> = {
          permanently_closed: "Permanently Closed",
          temporarily_closed: "Temporarily Closed",
          wrong_address: "Wrong Address",
          wrong_phone: "Wrong Phone Number",
          wrong_hours: "Wrong Hours",
          wrong_materials: "Wrong Materials Accepted",
          duplicate_listing: "Duplicate Listing",
          other: "Other Issue",
        };

        // Notify owner about new report
        await notifyOwner({
          title: "New Facility Issue Report",
          content: `A user has reported an issue with a facility:\n\n**${input.facilityName}**\n${input.facilityAddress}\n\n**Issue Type:** ${issueTypeLabels[input.issueType]}\n${input.description ? `**Description:** ${input.description}` : ''}\n\nPlease review in the admin panel.`,
        });

        return { success: true, message: "Thank you for your report! We will review it shortly." };
      }),

    // Admin-only endpoint - list all reports
    list: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const reports = await getFacilityReports(input?.status);
        return reports;
      }),

    // Admin-only endpoint - update report status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "reviewed", "resolved", "dismissed"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateFacilityReportStatus(input.id, input.status, input.adminNotes);
        return { success: true };
      }),

    // Admin-only endpoint - get single report by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const report = await getFacilityReportById(input.id);
        if (!report) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
        }
        return report;
      }),

    // Admin-only endpoint - delete a report
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFacilityReport(input.id);
        return { success: true };
      }),

    // Admin-only endpoint - get report statistics
    stats: adminProcedure
      .query(async () => {
        const stats = await getReportStats();
        return stats;
      }),
  }),

  // Facility reviews routes
  reviews: router({
    // Protected endpoint - submit a review (must be logged in)
    submit: protectedProcedure
      .input(facilityReviewSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await createFacilityReview({
            userId: ctx.user.id,
            userName: ctx.user.name || "Anonymous",
            facilityId: input.facilityId,
            facilityName: input.facilityName,
            facilityAddress: input.facilityAddress,
            rating: input.rating,
            title: input.title || null,
            content: input.content || null,
            serviceRating: input.serviceRating || null,
            cleanlinessRating: input.cleanlinessRating || null,
            convenienceRating: input.convenienceRating || null,
          });

          return { success: true, id: result.id, message: "Thank you for your review!" };
        } catch (error) {
          if (error instanceof Error && error.message.includes("already reviewed")) {
            throw new TRPCError({ code: 'CONFLICT', message: error.message });
          }
          throw error;
        }
      }),

    // Protected endpoint - update own review
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        rating: z.number().min(1).max(5).optional(),
        title: z.string().max(255).optional(),
        content: z.string().max(2000).optional(),
        serviceRating: z.number().min(1).max(5).optional(),
        cleanlinessRating: z.number().min(1).max(5).optional(),
        convenienceRating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        try {
          await updateFacilityReview(id, ctx.user.id, updates);
          return { success: true, message: "Review updated successfully" };
        } catch (error) {
          if (error instanceof Error) {
            throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
          }
          throw error;
        }
      }),

    // Protected endpoint - delete own review
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteFacilityReview(input.id, ctx.user.id, ctx.user.role === 'admin');
        return { success: true, message: "Review deleted" };
      }),

    // Public endpoint - get reviews for a facility
    list: publicProcedure
      .input(z.object({ facilityId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        const reviews = await getFacilityReviews(input.facilityId);
        return reviews;
      }),

    // Public endpoint - get rating stats for a facility
    stats: publicProcedure
      .input(z.object({ facilityId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        const stats = await getFacilityRatingStats(input.facilityId);
        return {
          avgRating: stats?.avgRating ? Number(stats.avgRating.toFixed(1)) : null,
          totalReviews: stats?.totalReviews ? Number(stats.totalReviews) : 0,
          avgService: stats?.avgService ? Number(stats.avgService.toFixed(1)) : null,
          avgCleanliness: stats?.avgCleanliness ? Number(stats.avgCleanliness.toFixed(1)) : null,
          avgConvenience: stats?.avgConvenience ? Number(stats.avgConvenience.toFixed(1)) : null,
        };
      }),

    // Public endpoint - get batch rating stats for multiple facilities
    batchStats: publicProcedure
      .input(z.object({ facilityIds: z.array(z.string().min(1).max(64)).max(100) }))
      .query(async ({ input }) => {
        const statsMap = await getBatchFacilityRatingStats(input.facilityIds);
        return statsMap;
      }),

    // Public endpoint - get top-rated facilities
    topRated: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(20).optional() }).optional())
      .query(async ({ input }) => {
        const topRated = await getTopRatedFacilities(input?.limit || 6);
        return topRated;
      }),

    // Protected endpoint - check if user has reviewed a facility
    hasReviewed: protectedProcedure
      .input(z.object({ facilityId: z.string().min(1).max(64) }))
      .query(async ({ ctx, input }) => {
        const hasReviewed = await hasUserReviewedFacility(ctx.user.id, input.facilityId);
        return { hasReviewed };
      }),

    // Protected endpoint - mark review as helpful
    markHelpful: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await addHelpfulVote(input.reviewId, ctx.user.id);
          return { success: true, message: "Marked as helpful" };
        } catch (error) {
          if (error instanceof Error && error.message.includes("already marked")) {
            throw new TRPCError({ code: 'CONFLICT', message: error.message });
          }
          throw error;
        }
      }),

    // Protected endpoint - remove helpful vote
    unmarkHelpful: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeHelpfulVote(input.reviewId, ctx.user.id);
        return { success: true, message: "Removed helpful vote" };
      }),

    // Protected endpoint - get user's helpful votes
    helpfulVotes: protectedProcedure
      .query(async ({ ctx }) => {
        const votes = await getUserHelpfulVotes(ctx.user.id);
        return votes;
      }),

    // Admin-only endpoint - list all reviews
    adminList: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const reviews = await getAllReviewsForAdmin(input?.status);
        return reviews;
      }),

    // Admin-only endpoint - update review status
    adminUpdateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateReviewStatus(input.id, input.status, input.adminNotes);
        return { success: true };
      }),

    // Admin-only endpoint - delete any review
    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFacilityReview(input.id, 0, true);
        return { success: true };
      }),

    // Admin-only endpoint - get review statistics
    adminStats: adminProcedure
      .query(async () => {
        const stats = await getReviewStats();
        return stats;
      }),
  }),

  // Newsletter subscription routes
  newsletter: router({
    // Public endpoint - anyone can subscribe
    subscribe: publicProcedure
      .input(newsletterSubscriptionSchema)
      .mutation(async ({ input }) => {
        const result = await createNewsletterSubscription({
          email: input.email,
          zipCode: input.zipCode,
          age: input.age || null,
          gender: input.gender || null,
          sex: input.sex || null,
          additionalInfo: input.additionalInfo || null,
        });

        if (result.alreadySubscribed) {
          return { 
            success: false, 
            message: "This email is already subscribed to our newsletter." 
          };
        }

        if (result.reactivated) {
          return { 
            success: true, 
            message: "Welcome back! Your subscription has been reactivated." 
          };
        }

        // Notify owner about new subscription
        await notifyOwner({
          title: "New Newsletter Subscription",
          content: `A new user has subscribed to the newsletter:\n\n**Email:** ${input.email}\n**Zip Code:** ${input.zipCode}${input.age ? `\n**Age:** ${input.age}` : ''}${input.gender ? `\n**Gender:** ${input.gender}` : ''}${input.additionalInfo ? `\n**Additional Info:** ${input.additionalInfo}` : ''}`,
        });

        return { 
          success: true, 
          message: "Thank you for subscribing! You'll receive recycling tips and updates for your area." 
        };
      }),

    // Admin-only endpoint - list all subscribers
    list: adminProcedure
      .input(z.object({
        activeOnly: z.boolean().optional().default(true),
      }).optional())
      .query(async ({ input }) => {
        const subscribers = await getNewsletterSubscribers(input?.activeOnly ?? true);
        return subscribers;
      }),

    // Admin-only endpoint - get subscription statistics
    stats: adminProcedure
      .query(async () => {
        const stats = await getNewsletterStats();
        return stats;
      }),
  }),
});

export type AppRouter = typeof appRouter;
