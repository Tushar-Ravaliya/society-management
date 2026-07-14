import { z } from "zod";

export const assignCommitteeMemberSchema = z.object({
  userId: z.string().uuid("Invalid User ID format"),
  designation: z.string().min(1, "Designation is required").max(100),
  portfolio: z.string().min(1, "Portfolio is required").max(255),
  termStart: z.string().datetime("Term start must be a valid ISO datetime string"),
  termEnd: z.string().datetime("Term end must be a valid ISO datetime string"),
});

export const updateCommitteeMemberSchema = z.object({
  designation: z.string().min(1, "Designation cannot be empty").max(100).optional(),
  portfolio: z.string().min(1, "Portfolio cannot be empty").max(255).optional(),
  isActive: z.boolean().optional(),
});
