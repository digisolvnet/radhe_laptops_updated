import mongoose from 'mongoose';
import { config } from '../config/env.config.js';

const DB_NAME = 'mobilex';

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URL, {
      dbName: DB_NAME, // Recommended way instead of appending in URL
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

export { connectDB };
