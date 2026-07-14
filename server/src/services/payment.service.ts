import Razorpay from "razorpay";
import crypto from "crypto";
import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../db/db";
import { users, maintenanceBills, payments } from "../db/schema";
import { config } from "../config/config";
import { AppError } from "../middlewares/errorHandler";

let razorpay: Razorpay | null = null;
if (process.env.NODE_ENV !== "test") {
  if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });
  }
}

export class PaymentService {
  // Record Offline Payment (Resident raises claim)
  public static async recordOfflinePayment(
    data: {
      billId: string;
      paymentMethod: "cash" | "bank_transfer" | "cheque";
      amount: number;
      transactionReference: string;
    },
    residentId: string
  ): Promise<any> {
    // 1. Verify bill exists
    const billRecords = await db
      .select()
      .from(maintenanceBills)
      .where(eq(maintenanceBills.id, data.billId))
      .limit(1);

    if (billRecords.length === 0) {
      throw new AppError("Maintenance bill not found", 404);
    }

    const bill = billRecords[0];
    if (bill.status === "paid") {
      throw new AppError("This bill has already been paid", 400);
    }

    // Check unique transaction reference constraint
    const existingRef = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionReference, data.transactionReference))
      .limit(1);

    if (existingRef.length > 0) {
      throw new AppError("Transaction reference already exists", 409);
    }

    const [payment] = await db
      .insert(payments)
      .values({
        billId: data.billId,
        residentId,
        paymentMethod: data.paymentMethod,
        amount: data.amount.toFixed(2),
        transactionReference: data.transactionReference,
        status: "pending",
      })
      .returning();

    return payment;
  }

  // Create Razorpay Order
  public static async createOnlineOrder(billId: string, residentId: string): Promise<any> {
    const billRecords = await db
      .select()
      .from(maintenanceBills)
      .where(eq(maintenanceBills.id, billId))
      .limit(1);

    if (billRecords.length === 0) {
      throw new AppError("Maintenance bill not found", 404);
    }

    const bill = billRecords[0];
    if (bill.status === "paid") {
      throw new AppError("This bill has already been paid", 400);
    }

    const amountInPaise = Math.round(Number(bill.totalAmount) * 100);

    let order;
    if (process.env.NODE_ENV === "test") {
      order = {
        id: `order_mock_${Math.random().toString(36).substring(7)}`,
        amount: amountInPaise,
        currency: "INR",
      };
    } else {
      if (!razorpay) {
        throw new AppError("Razorpay keys are not configured on the server", 500);
      }
      try {
        order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: bill.billNumber,
        });
      } catch (err: any) {
        throw new AppError(`Razorpay order creation failed: ${err.message}`, 500);
      }
    }

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      billNumber: bill.billNumber,
    };
  }

  // Verify online Razorpay payment (instant transaction)
  public static async verifyOnlinePayment(
    data: {
      billId: string;
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    },
    residentId: string
  ): Promise<any> {
    // 1. Verify bill exists
    const billRecords = await db
      .select()
      .from(maintenanceBills)
      .where(eq(maintenanceBills.id, data.billId))
      .limit(1);

    if (billRecords.length === 0) {
      throw new AppError("Maintenance bill not found", 404);
    }

    const bill = billRecords[0];
    if (bill.status === "paid") {
      throw new AppError("This bill has already been paid", 400);
    }

    // 2. Mathematically verify signature using local HMAC SHA-256
    const signText = data.razorpayOrderId + "|" + data.razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(signText)
      .digest("hex");

    if (generatedSignature !== data.razorpaySignature) {
      throw new AppError("Payment verification failed: Signature mismatch", 400);
    }

    // 3. Check duplicate payments
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionReference, data.razorpayPaymentId))
      .limit(1);

    if (existingPayment.length > 0) {
      throw new AppError("This payment has already been verified", 409);
    }

    // 4. Atomically insert payment as verified and update bill to paid
    return await db.transaction(async (tx) => {
      const [payment] = await tx
        .insert(payments)
        .values({
          billId: data.billId,
          residentId,
          paymentMethod: "online",
          amount: bill.totalAmount,
          transactionReference: data.razorpayPaymentId,
          status: "verified",
          verifiedAt: new Date(),
        })
        .returning();

      await tx
        .update(maintenanceBills)
        .set({
          status: "paid",
          updatedAt: new Date(),
        })
        .where(eq(maintenanceBills.id, data.billId));

      return {
        payment,
        billStatus: "paid",
      };
    });
  }

  // Admin approves/rejects offline payment claim
  public static async verifyPayment(
    paymentId: string,
    data: {
      status: "verified" | "failed";
      verificationNotes?: string | null;
    },
    adminId: string
  ): Promise<any> {
    // 1. Fetch payment
    const paymentRecords = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (paymentRecords.length === 0) {
      throw new AppError("Payment claim not found", 404);
    }

    const payment = paymentRecords[0];
    if (payment.status !== "pending") {
      throw new AppError(`This payment is already processed as '${payment.status}'`, 400);
    }

    return await db.transaction(async (tx) => {
      // Update payment
      const [updatedPayment] = await tx
        .update(payments)
        .set({
          status: data.status,
          verificationNotes: data.verificationNotes || null,
          verifiedById: adminId,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId))
        .returning();

      let billStatus = "unpaid";

      if (data.status === "verified") {
        billStatus = "paid";
        // Update associated bill status to paid
        await tx
          .update(maintenanceBills)
          .set({
            status: "paid",
            updatedAt: new Date(),
          })
          .where(eq(maintenanceBills.id, payment.billId));
      }

      return {
        payment: updatedPayment,
        billStatus,
      };
    });
  }

  // Fetch payments feed (scoped by user role)
  public static async getPayments(
    filters: {
      status?: "pending" | "verified" | "failed";
      page: number;
      limit: number;
    },
    userId: string,
    userRole: string
  ) {
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const offset = (page - 1) * limit;

    const conditions = [];

    // Role-based visibility
    if (userRole === "resident") {
      conditions.push(eq(payments.residentId, userId));
    }

    if (filters.status) {
      conditions.push(eq(payments.status, filters.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        id: payments.id,
        amount: payments.amount,
        transactionReference: payments.transactionReference,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        paymentDate: payments.paymentDate,
        residentName: users.name,
        billNumber: maintenanceBills.billNumber,
      })
      .from(payments)
      .innerJoin(users, eq(payments.residentId, users.id))
      .innerJoin(maintenanceBills, eq(payments.billId, maintenanceBills.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .where(whereClause);

    const [results, countResult] = await Promise.all([query, countQuery]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      payments: results,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
