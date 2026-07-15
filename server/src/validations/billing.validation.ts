import { z } from "zod";

export const generateBatchBillsSchema = z.object({
  billingPeriod: z.string().min(1, "Billing period is required").max(50),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Due date must be a valid date string"),
  defaultMaintenance: z.number().min(0, "Maintenance amount must be a positive number"),
  defaultWater: z.number().min(0, "Water amount must be a positive number").optional().default(0),
  defaultElectricity: z.number().min(0, "Electricity amount must be a positive number").optional().default(0),
});
