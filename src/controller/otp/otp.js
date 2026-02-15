// controllers/otpController.js
import Otp from "../../models/otp/otp.js";
import { sendEmail } from "../../controller/otp/emailService.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Save OTP to database
    await Otp.create({ email, otp, expiresAt });

    // Send email with OTP
    const emailSent = await sendEmail({
      to: email,
      subject: "Your OTP for Email Verification",
      text: `Your OTP is: ${otp}. It will expire in 15 minutes.`,
    });

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the most recent OTP for this email
    const otpRecord = await Otp.findOne({
      email,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Optionally: Mark email as verified in your user model here

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};