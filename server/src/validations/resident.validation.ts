import { z } from "zod";

export const createUnitSchema = z.object({
  block: z.string().min(1, "Block is required").max(50),
  flatNumber: z.string().min(1, "Flat number is required").max(50),
  floor: z.number().int("Floor must be an integer"),
  bhkType: z.string().min(1, "BHK type is required").max(10),
});

export const updateUnitSchema = createUnitSchema.partial();

export const onboardResidentSchema = z.object({
  email: z.email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  unitId: z.string().uuid("Invalid Unit ID format"),
  residencyType: z.enum(["owner", "tenant"]),
  phoneNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

export const updateResidentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  phoneNumber: z.string().optional().nullable(),
  residencyType: z.enum(["owner", "tenant"]).optional(),
  vehicleNumber: z.string().optional().nullable(),
});
