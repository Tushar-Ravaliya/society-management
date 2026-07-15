import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import { unitRouter, residentRouter } from "./routes/resident.route";
import committeeRoutes from "./routes/committee.route";
import announcementRoutes from "./routes/announcement.route";
import complaintRoutes from "./routes/complaint.route";
import serviceRequestRoutes from "./routes/service-request.route";
import billingRoutes from "./routes/billing.route";
import paymentRoutes from "./routes/payment.route";
import dashboardRoutes from "./routes/dashboard.route";
import reportRoutes from "./routes/report.route";
import auditRoutes from "./routes/audit.route";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/units", unitRouter);
app.use("/api/residents", residentRouter);
app.use("/api/committee", committeeRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/audit-logs", auditRoutes);

app.get("/health", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message || String(error),
    });
  }
});

app.use(errorHandler);

export default app;
