import { z } from "zod";

export const recordOfflinePaymentSchema = z.object({
  billId: z.string().uuid("Invalid Bill ID format"),
  paymentMethod: z.enum(["cash", "bank_transfer", "cheque"]),
  amount: z.number().positive("Payment amount must be greater than zero"),
  transactionReference: z.string().min(1, "Transaction reference is required").max(255),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(["verified", "failed"]),
  verificationNotes: z.string().min(1, "Verification notes cannot be empty").max(255).optional().nullable(),
});

export const createOnlineOrderSchema = z.object({
  billId: z.string().uuid("Invalid Bill ID format"),
});

export const verifyOnlinePaymentSchema = z.object({
  billId: z.string().uuid("Invalid Bill ID format"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});
