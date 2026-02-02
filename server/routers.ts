import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createFacilitySubmission, getFacilitySubmissions, updateFacilitySubmissionStatus } from "./db";
import { notifyOwner } from "./_core/notification";

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

    // Admin-only endpoint - list all submissions
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const submissions = await getFacilitySubmissions(input?.status);
        return submissions;
      }),

    // Admin-only endpoint - update submission status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateFacilitySubmissionStatus(input.id, input.status, input.reviewNotes);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
