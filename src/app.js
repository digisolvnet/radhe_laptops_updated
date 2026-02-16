
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { StatusCodes } from "http-status-codes";

import routes from "./routes/index.js";
import { customError, NotFoundError } from "./utils/custumError.js";

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ======================================================
   CORS Configuration
====================================================== */

app.use(
  cors({
    origin: [
      "http://localhost:5173",        // Local frontend
      "https://radhelaptops.com",     // Production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ======================================================
   Middlewares
====================================================== */

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

/* ======================================================
   Static Files
====================================================== */

// Serve uploaded images
app.use("/images", express.static(path.join(__dirname, "uploads")));

// Serve frontend build (if using same server for frontend)
app.use(express.static(path.join(__dirname, "dist")));

console.log("Serving static files from:", path.join(__dirname, "uploads"));

/* ======================================================
   Health Check Route (Important for Render)
====================================================== */

app.get("/", (req, res) => {
  res.status(StatusCodes.OK).json({
    status: "success",
    message: "🚀 Backend Server Running Successfully",
  });
});

/* ======================================================
   API Routes
====================================================== */

app.use("/api/v1", routes);

/* ======================================================
   404 Handler (Must Be After Routes)
====================================================== */

app.all("*", (req, res, next) => {
  next(new NotFoundError("Route not exist in server", "app.js file"));
});

/* ======================================================
   Global Error Handler
====================================================== */

app.use((err, _req, res, _next) => {
  if (err instanceof customError) {
    return res.status(err.statusCodes).json(err.serializeError());
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message || "Something went wrong",
    status: "error",
    error: err.name,
  });
});

export default app;
