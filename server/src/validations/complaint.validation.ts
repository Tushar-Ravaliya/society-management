import { z } from "zod";

export const lodgeComplaintSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 characters long").max(255),
  description: z
    .string()
    .min(1, "Description must be at least 1 characters long"),
  category: z
    .string()
    .min(1, "Category must be at least 1 characters long")
    .max(100),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const assignComplaintSchema = z.object({
  assignedToId: z.string().uuid("Invalid assignee User ID format"),
});

export const resolveComplaintSchema = z.object({
  status: z.enum(["resolved", "rejected"]),
  resolutionDetails: z
    .string()
    .min(1, "Resolution details must be at least 1 characters long"),
});
