import { z } from "zod";

export const raiseServiceRequestSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character long").max(255),
  description: z.string().min(1, "Description must be at least 1 character long"),
  requestType: z.enum(["noc", "clubhouse_booking", "renovation_permission", "parking_allocation", "other"]),
  preferredDate: z.string().datetime("Preferred date must be a valid ISO datetime string").optional().nullable(),
});

export const processServiceRequestSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "completed"]),
  adminRemarks: z.string().min(1, "Remarks must be at least 1 character long").optional().nullable(),
});
