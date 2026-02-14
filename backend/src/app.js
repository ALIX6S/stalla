import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { swaggerSpec } from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { sendResponse } from "./utils/response.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/receipts", express.static(path.join(process.cwd(), "receipts")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) =>
  sendResponse(res, {
    message: "API STALLA opérationnelle",
    data: { uptime: process.uptime() },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/public", publicRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
