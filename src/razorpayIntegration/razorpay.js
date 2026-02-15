import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/env.config.js";

// Debugging: Log Razorpay credentials
console.log("Razorpay Key ID:", config.RAZORPAY_KEY_ID);
console.log("Razorpay Key Secret:", config.RAZORPAY_KEY_SECRET);

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

// Verify Payment Endpoint
const razorpay = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // Validate the request payload
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    // Create the expected signature
    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare the signatures
    if (expectedSignature === razorpay_signature) {
      // Payment is successful
      res.status(200).json({ success: true });
    } else {
      // Payment verification failed
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

// Create Order Endpoint
const createOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    // Validate the request payload
    if (!amount || !receipt) {
      return res.status(400).json({ error: "Amount and receipt are required" });
    }

    // Ensure the amount is in paise (e.g., 1000 = ₹10)
    const amountInPaise = parseInt(amount, 10);
    if (isNaN(amountInPaise)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: receipt,
      payment_capture: 1,
    });

    // Return the order ID to the frontend
    res.status(200).json({ id: order.id });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export { razorpay, createOrder };