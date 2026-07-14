import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import { unitRouter, residentRouter } from "./routes/resident.route";
import committeeRoutes from "./routes/committee.route";
import announcementRoutes from "./routes/announcement.route";
import complaintRoutes from "./routes/complaint.route";
import serviceRequestRoutes from "./routes/service-request.route";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/units", unitRouter);
app.use("/api/residents", residentRouter);
app.use("/api/committee", committeeRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/service-requests", serviceRequestRoutes);

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.use(errorHandler);

export default app;
