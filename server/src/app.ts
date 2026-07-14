import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.use(errorHandler);

export default app;
