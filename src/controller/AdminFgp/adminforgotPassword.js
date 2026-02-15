// src/controllers/authController.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Admin } from "../../models/admin/admin.model.js";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Forgot password handler
const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password/${resetToken}`;
    const message = `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">You recently requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 10px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #888;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: message,
    });
    res
      .status(200)
      .json({ success: true, message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user with valid reset token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log("New Entered Password:", password);

    // ✅ Directly assign new password, let pre-save middleware hash it
    user.password = password;

    // Remove reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save updated user
    await user.save();
    console.log("Password after saving in DB:", user.password);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify reset token
const adminVerifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ valid: false, message: "Invalid or expired token" });
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { adminForgotPassword, adminResetPassword, adminVerifyResetToken };
