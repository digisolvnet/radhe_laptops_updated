import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { customError, NotFoundError } from "./utils/custumError.js";
import { StatusCodes } from "http-status-codes";
import path from "path";
import { fileURLToPath } from "url";


// Fix: Define __dirname before using it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend URL https://radhelaptops.com
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: "Content-Type,Authorization" ,// Add Authorization header
    credentials: true, // Allow cookies with requests
  })
);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from the "uploads" directory
app.use("/images", express.static(path.join(__dirname, "uploads")));
// Serve frontend build files
app.use(express.static(path.join(__dirname, "dist")));

// Log the static file path for debugging
console.log("Serving static files from:", path.join(__dirname, "uploads"));

// All routes
app.use("/api/v1", routes);

// Handle 404 - Not Found Error
app.all("*", (req, res, next) => {
  next(new NotFoundError("Route not exist in server", "app.js file"));
});

// Custom error handling middleware
app.use((err, _req, res, next) => {
  if (err instanceof customError) {
    res.status(err.statusCodes).json(err.serializeError());
  } else {
    res.status(StatusCodes.BAD_GATEWAY).json({
      message: err.message || "Something went wrong",
      status: "error",
      error: err.name,
    });
  }
});

export default app;