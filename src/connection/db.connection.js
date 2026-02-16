import mongoose from "mongoose";
import { config } from "../config/env.config.js";

const DB_NAME = "mobilex";

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URL, {
      dbName: DB_NAME,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export { connectDB };
