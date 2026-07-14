import { z } from "zod";

export const generateBatchBillsSchema = z.object({
  billingPeriod: z.string().min(1, "Billing period is required").max(50),
  dueDate: z.iso.datetime("Due date must be a valid ISO datetime string"),
  defaultMaintenance: z.number().min(0, "Maintenance amount must be a positive number"),
  defaultWater: z.number().min(0, "Water amount must be a positive number").optional().default(0),
  defaultElectricity: z.number().min(0, "Electricity amount must be a positive number").optional().default(0),
});
