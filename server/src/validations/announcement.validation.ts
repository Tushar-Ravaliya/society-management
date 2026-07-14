import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 characters long").max(255),
  content: z.string().min(3, "Content must be at least 3 characters long"),
  audience: z.enum(["all", "residents", "committee"]).default("all"),
  isPinned: z.boolean().optional().default(false),
  expiresAt: z.iso
    .datetime("Expires at must be a valid ISO datetime string")
    .optional()
    .nullable(),
});
