import dotenv from 'dotenv';

dotenv.config();

class Config {
  MONGODB_URL;
  JWT_SECRET;
  RAZORPAY_KEY_ID;
  RAZORPAY_KEY_SECRET;


  constructor() {
    this.MONGODB_URL = process.env.MONGODB_URL;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    this.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  }
}

export const config = new Config();
